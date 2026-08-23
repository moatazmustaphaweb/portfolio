import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { getLocale } from "next-intl/server";

import { getSettings } from "@/lib/content/settings";
import type { Locale } from "@/lib/content/types";

import "./globals.css";

/**
 * Root layout — the document.
 *
 * This file exists to fix a real bug: there was no root layout, so `<html>`
 * was rendered by `app/[locale]/layout.tsx`. A `notFound()` thrown anywhere,
 * and any unmatched URL, had no layout above it that produced a document —
 * so Next fell back to its built-in error shell (`<html id="__next_error__">`)
 * with no `lang`, no `dir`, no chrome, and none of the `not_found_*` copy.
 * `app/[locale]/not-found.tsx` was dead code the entire time.
 *
 * Everything locale-specific still lives in `app/[locale]/layout.tsx`. Only
 * the document shell moved up: `<html>`, `<body>`, the fonts, and the
 * pre-paint theme script.
 *
 * `getLocale()` resolves from the middleware, so `lang` and `dir` stay correct
 * on a 404 for an Arabic URL — the gap decision 013's fallback rule could not
 * cover, because there was no page to fall back to.
 */

/*
 * LATIN — Geist for everything, Geist Mono for metadata only. Unchanged.
 * ARABIC — LANTX for headings, Meral Sans for body (decision 045). Both
 * self-hosted from app/fonts as woff2; no CDN.
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
  src: [{ path: "./fonts/LANTX-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-lantx",
  display: "swap",
  adjustFontFallback: false,
});

/* Meral Sans — Arabic body. The four weights the type scale can request. */
const meralSans = localFont({
  src: [
    { path: "./fonts/MeralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/MeralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/MeralSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/MeralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-meral",
  display: "swap",
  adjustFontFallback: false,
});

/*
 * ── THIS EXISTS FOR EXACTLY ONE ROUTE: THE 404 ──────────────────────────────
 *
 * `app/[locale]/layout.tsx` already sets `title` from the database, and every
 * page under `[locale]` inherits it or overrides it. **This changes none of
 * them** — the nearer layout wins.
 *
 * What it reaches is `app/not-found.tsx`, which sits ABOVE `[locale]` because
 * an unmatched URL has no locale segment to render inside. It was therefore
 * the one route in the app with no metadata anywhere in its chain, and it
 * shipped with an empty <title>: a blank browser tab, and a screen reader that
 * announces nothing when the page opens. axe rates it `serious`
 * (`document-title`) — `docs/accessibility-audit.md` finding 5.
 *
 * ── WHY NOT `global-not-found.tsx` ──────────────────────────────────────────
 *
 * It is the file built for this and it supports metadata directly, so it was
 * the first choice and was rejected on the docs. Next's own reference says it
 * is for apps that CANNOT compose a 404 from `layout.js` + `not-found.js` —
 * multiple root layouts, or a root layout on a dynamic segment. This app has
 * one static root layout and can. It is also experimental, and it **bypasses
 * the layout entirely**: fonts, the pre-paint theme script and `globals.css`
 * would all have to be duplicated into it, and the locale — which
 * `not-found.tsx` gets from `getLocale()` via the middleware — would have to
 * be re-established. That risks the Arabic 404, which is the bug this file was
 * created to fix in the first place.
 *
 * ── RULE 1 ──────────────────────────────────────────────────────────────────
 *
 * The title is `settings.name`, from the database. No literal. If that setting
 * were ever NULL this returns `{}` and the 404 goes back to having no title —
 * omitting rather than substituting, which is the rule the locale layout
 * already applies to `tagline` and `og_image`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const settings = await getSettings(locale);
  const name = settings.get("name");
  return name ? { title: name } : {};
}

export const viewport: Viewport = {
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
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');var explicit=(t==='light'||t==='dark');if(explicit)document.documentElement.setAttribute('data-theme',t);var light=explicit?(t==='light'):window.matchMedia('(prefers-color-scheme: light)').matches;var m=document.createElement('meta');m.name='theme-color';m.content=light?'#ffffff':'#000000';document.head.appendChild(m);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geist.variable} ${geistMono.variable} ${lantx.variable} ${meralSans.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        {children}
      </body>
    </html>
  );
}
