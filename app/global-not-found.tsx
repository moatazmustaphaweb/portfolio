import type { Metadata } from "next";
import Script from "next/script";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";

import { fontVariables } from "@/app/fonts";
import { NotFoundView } from "@/components/layout/NotFoundView";
import { NOINDEX, THEME_INIT, VIEWPORT } from "@/components/layout/document";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/content/settings";
import type { Locale } from "@/lib/content/types";

import "./globals.css";

/**
 * 404 for every URL that matches no route — the designed page, as a full
 * document.
 *
 * ── WHY THIS FILE NOW ───────────────────────────────────────────────────────
 *
 * Task 003261026 moved `<html>` into `app/[locale]/layout.tsx` and removed the
 * root `app/layout.tsx`, whose `getLocale()` made every page on the site
 * dynamic. With the root layout on a dynamic segment there is no layout left
 * for an unmatched URL to render inside, which is exactly the case Next's
 * reference gives for this file. It bypasses every layout, so it carries its
 * own document: `globals.css`, the fonts, the pre-paint theme script. Enabled
 * by `experimental.globalNotFound` in `next.config.mjs`.
 *
 * ── LANG AND DIR ────────────────────────────────────────────────────────────
 *
 * There is no route param here. `getLocale()` reads the locale the next-intl
 * proxy resolved for this request — from the URL prefix for `/ar/anything`,
 * otherwise from the cookie and `Accept-Language` — so an Arabic 404 is Arabic
 * in the server HTML. That reads request headers, which makes this one route
 * render per request. A 404 is not cached anyway; every page is unaffected.
 */

async function resolveLocale(): Promise<Locale> {
  const requested = await getLocale();
  return hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
}

/*
 * Rule 1: the title is `settings.name`, from the database. If it were NULL the
 * title is omitted rather than substituted. Next adds `noindex` to every 404
 * on its own; NOINDEX is kept for parity with the pages.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const settings = await getSettings(locale);
  const name = settings.get("name");
  return name ? { title: name, ...NOINDEX } : { ...NOINDEX };
}

export const viewport = VIEWPORT;

export default async function GlobalNotFound() {
  const locale = await resolveLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={fontVariables} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <NotFoundView locale={locale} header />
      </body>
    </html>
  );
}
