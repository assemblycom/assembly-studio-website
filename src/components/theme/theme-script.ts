// Deliberately NOT a "use client" module.
//
// THEME_INIT_SCRIPT is a string the server layout inlines into <head>. When it
// lived in theme-provider.tsx — which is "use client" — the server did not get
// the string at all: Next hands a server importer a client-reference proxy, and
// stringifying that emitted `function(){throw Error("Attempted to call
// THEME_INIT_SCRIPT() from the server...")}` into the page. That is a syntax
// error at the top level, so the pre-paint script never ran in a production
// build and every visitor with a dark preference watched the page paint light
// and flip after hydration. Keeping these three values in a plain module is what
// makes the script real; theme-provider.tsx imports them back from here.

// The resolved theme actually applied to <html data-theme>.
export type Theme = "light" | "dark";
// The user's stored preference — "system" follows the OS (Cursor-style).
export type ThemePreference = "system" | "light" | "dark";

export const STORAGE_KEY = "studio-theme";
export const DEFAULT_PREFERENCE: ThemePreference = "system";

// Run before paint so the right theme is on <html> before React hydrates.
// Resolves "system" against the OS.
export const THEME_INIT_SCRIPT = `try{var p=localStorage.getItem('${STORAGE_KEY}');if(p!=='dark'&&p!=='light'&&p!=='system')p='${DEFAULT_PREFERENCE}';var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}`;
