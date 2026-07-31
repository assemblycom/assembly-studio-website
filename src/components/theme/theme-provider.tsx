"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";

// The resolved theme actually applied to <html data-theme>.
export type Theme = "light" | "dark";
// The user's stored preference — "system" follows the OS (Cursor-style).
export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "studio-theme";
const DEFAULT_PREFERENCE: ThemePreference = "system";

// Inline script run before paint (in the document head) so the right theme is
// on <html> before React hydrates — no flash. Resolves "system" against the OS.
// Kept in sync with STORAGE_KEY / DEFAULT_PREFERENCE below.
export const THEME_INIT_SCRIPT = `try{var p=localStorage.getItem('${STORAGE_KEY}');if(p!=='dark'&&p!=='light'&&p!=='system')p='${DEFAULT_PREFERENCE}';var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}`;

type ThemeContextValue = {
  // Resolved theme (light/dark) — what's actually shown.
  theme: Theme;
  // The user's preference (system/light/dark) — what the switch reflects.
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(DEFAULT_PREFERENCE);
  const [theme, setThemeState] = useState<Theme>("light");
  // The one place <html data-theme> is kept in step with the state above.
  // setPreference writes the attribute too, but only so the swap can be
  // captured inside a view transition.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Adopt the persisted preference, and resolve the theme from it rather than
  // from <html data-theme>. The attribute is not a safe source here: the sync
  // effect above runs first and has already overwritten whatever the pre-paint
  // script resolved with this component's initial "light" state, so reading it
  // back handed every visitor light and dropped a saved dark preference on the
  // first render.
  useEffect(() => {
    let p: ThemePreference = DEFAULT_PREFERENCE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light" || stored === "system") {
        p = stored;
      }
    } catch {
      // storage unavailable
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferenceState(p);

    setThemeState(p === "system" ? systemTheme() : p);
  }, []);

  // While on "system", track OS changes live so the site follows the setting.
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setThemeState(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    const resolved = next === "system" ? systemTheme() : next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable — in-memory still drives the session
    }
    const commit = () => {
      document.documentElement.dataset.theme = resolved;
      setPreferenceState(next);
      setThemeState(resolved);
    };
    // A single GPU-composited crossfade (View Transitions) is smoother than
    // repainting every element's colors at once. flushSync lands the markup
    // before the "after" snapshot. Fall back to an instant swap otherwise.
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

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
