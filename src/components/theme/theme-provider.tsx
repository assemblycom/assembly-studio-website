"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

// The View Transitions API isn't in the DOM lib types everywhere yet.
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

// The site defaults to light. The chosen theme is persisted so it survives
// navigation and reloads, and applied as data-theme on <html> so the CSS
// tokens (and every token-based surface) flip site-wide.
const STORAGE_KEY = "studio-theme";
const DEFAULT_THEME: Theme = "light";

// Inline script run before paint (in the document head) so the stored theme is
// applied to <html> before React hydrates — no flash of the wrong theme. Kept
// in sync with STORAGE_KEY / DEFAULT_THEME above.
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='dark'&&t!=='light')t='${DEFAULT_THEME}';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='${DEFAULT_THEME}';}`;

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start from the default for a stable first render, then adopt whatever the
  // pre-paint script wrote to <html> (the persisted choice) after mount.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    // Adopt the persisted choice the pre-paint script wrote to <html>. This is
    // the standard SSR-safe hydration pattern: default render, then sync once on
    // mount — the DOM can't be read during render without a hydration mismatch.
    const applied = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (applied === "dark" || applied === "light") setThemeState(applied);
  }, []);

  const applyTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    const commit = () => {
      root.dataset.theme = next;
      setThemeState(next);
    };

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the in-memory state still
      // drives the UI for the session.
    }

    // A single GPU-composited crossfade of the whole page (View Transitions) is
    // far smoother than the old approach of transitioning every element's colors
    // at once — that repainted the entire DOM each frame, which is what made the
    // switch stutter. flushSync lands React's theme-driven markup before the
    // "after" snapshot so nothing flashes mid-fade. Fall back to an instant swap
    // where the API is missing or the user prefers reduced motion.
    const doc = document as DocumentWithViewTransition;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReduced && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => flushSync(commit));
    } else {
      commit();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
