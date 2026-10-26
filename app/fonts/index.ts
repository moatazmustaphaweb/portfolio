import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

/*
 * The site's four typefaces, declared once.
 *
 * Two documents need them: `app/[locale]/layout.tsx` (every page) and
 * `app/global-not-found.tsx` (an unmatched URL, which bypasses every layout).
 * next/font must be called at module scope, so the declarations live here and
 * both import the class string. Moved out of the old `app/layout.tsx` in task
 * 003261026; the options are unchanged.
 *
 * LATIN — Geist for everything, Geist Mono for metadata only.
 * ARABIC — LANTX for headings, Meral Sans for body (decision 045). Both
 * self-hosted from this folder as woff2; no CDN.
 */
const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

/*
 * LANTX — Arabic headings. One weight by design: it is a display face and the
 * file ships Regular only. `font-synthesis-weight: none` in globals.css stops
 * the browser faking 600 and closing up the joins between letters.
 */
const lantx = localFont({
  src: [{ path: "./LANTX-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-lantx",
  display: "swap",
  adjustFontFallback: false,
});

/* Meral Sans — Arabic body. The four weights the type scale can request. */
const meralSans = localFont({
  src: [
    { path: "./MeralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./MeralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./MeralSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./MeralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-meral",
  display: "swap",
  adjustFontFallback: false,
});

/** The CSS-variable classes for `<html>`. */
export const fontVariables = `${geist.variable} ${geistMono.variable} ${lantx.variable} ${meralSans.variable}`;
