/* Colour theme primitives — shared by the pre-paint script in app/layout.tsx and the
   toggle (components/chrome/ThemeToggle.tsx), so the two cannot disagree about the key or
   the attribute.

   The resolved theme lives on <html data-theme="light|dark">; every dark-mode rule in
   app/theme.css keys off it. A visitor's explicit choice is stored only when it differs
   from their system setting — choosing what the system already says clears the stored
   value, so the site goes back to following the system. */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "swh:theme";
export const THEME_ATTRIBUTE = "data-theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

/* Runs in <head> before the first paint, so a dark-mode visitor never sees a white frame.
   Plain ES5 on purpose: it executes before any bundle and cannot rely on transpilation. */
export const THEME_BOOTSTRAP = `(function(){
  var d = document.documentElement, t = "light";
  try {
    var saved = localStorage.getItem("${THEME_STORAGE_KEY}");
    t = saved === "light" || saved === "dark" ? saved
      : (window.matchMedia && matchMedia("${DARK_QUERY}").matches ? "dark" : "light");
  } catch (e) {}
  d.setAttribute("${THEME_ATTRIBUTE}", t);
})();`;
