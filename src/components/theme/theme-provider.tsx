"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  DEFAULT_PREFERENCE,
  STORAGE_KEY,
  type Theme,
  type ThemePreference,
} from "./theme-script";

// The storage key, the default and the pre-paint script live in theme-script.ts,
// a plain module — see the note there for why they cannot live in this file.
export type { Theme, ThemePreference } from "./theme-script";
export { THEME_INIT_SCRIPT } from "./theme-script";

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
  // Whether the stored preference has been read yet. Until it has, this
  // component's idea of the theme is just its initial "light" — and writing that
  // to <html> is exactly the flash: the pre-paint script had already resolved
  // dark correctly, this effect painted over it with light, and the effect below
  // then put dark back a frame later. So the attribute is left alone until this
  // component actually knows which theme it is.
  const [adopted, setAdopted] = useState(false);
  // The one place <html data-theme> is kept in step with the state above.
  // setPreference writes the attribute too, but only so the swap can be
  // captured inside a view transition.
  useEffect(() => {
    if (!adopted) return;
    document.documentElement.dataset.theme = theme;
  }, [theme, adopted]);

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
    setAdopted(true);
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
