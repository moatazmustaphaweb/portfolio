import type { Metadata, Viewport } from "next";

/*
 * What every document on the site carries, whichever file renders `<html>`.
 *
 * Two files do: `app/[locale]/layout.tsx` (every page) and
 * `app/global-not-found.tsx` (an unmatched URL, which bypasses all layouts).
 * Before task 003261026 both of these lived in a root `app/layout.tsx`, whose
 * `getLocale()` read request headers and made every page dynamic.
 */

/*
 * ── NOINDEX OFF PRODUCTION ──────────────────────────────────────────────────
 *
 * Same condition as `app/robots.ts`: only `VERCEL_ENV === "production"` is
 * indexable, and unset counts as non-production. On production the key is
 * absent. Nothing below the locale layout sets `robots` except the draft
 * preview route, which sets the same value.
 */
export const NOINDEX: Metadata =
  process.env.VERCEL_ENV === "production"
    ? {}
    : { robots: { index: false, follow: false } };

export const VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

/*
 * Runs before first paint. Applies data-theme only for an explicit stored
 * choice, so the CSS media query keeps handling the OS default, and creates the
 * theme-color meta so mobile browser chrome matches from the first frame.
 * Dark is the default; light is used only when the OS asks for it.
 */
export const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');var explicit=(t==='light'||t==='dark');if(explicit)document.documentElement.setAttribute('data-theme',t);var light=explicit?(t==='light'):window.matchMedia('(prefers-color-scheme: light)').matches;var m=document.createElement('meta');m.name='theme-color';m.content=light?'#ffffff':'#000000';document.head.appendChild(m);}catch(e){}})();`;
