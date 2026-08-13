import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { Analytics } from "@/components/analytics/Analytics";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Metadata from the database, per rule 1 — no title or description literal
 * lives in this file. A setting that is still NULL (tagline, og_image) is
 * simply omitted rather than substituted, which is the fallback rule applied
 * to metadata.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const settings = await getSettings(locale as Locale);
  const name = settings.get("name");
  const ogImage = settings.get("og_image");

  /*
   * The domain line, not the tagline. This is the search-result snippet and
   * the link-preview subtitle: "Ten years designing regulated banking…" tells
   * a recruiter what this is, where "Simple, where it's hard." states a
   * position that only means something once you already know who wrote it.
   * Falls back to the tagline, and omits rather than inventing if both are unset.
   */
  const description = settings.get("description") ?? settings.get("tagline");

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      locale,
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering of a [locale] segment.
  setRequestLocale(locale);

  const typedLocale = locale as Locale;
  const ui = await getUiStrings(typedLocale);

  // Read on the server so the value is inlined; the banner is suppressed
  // entirely when GA is not configured.
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  /*
   * <html> and <body> live in app/layout.tsx now. They had to move: without a
   * root layout, notFound() had no boundary that rendered a document and fell
   * through to Next's built-in error shell. See that file.
   */
  return (
    <>
        <PersonJsonLd locale={typedLocale} />

        {/*
          Our own analytics: unconditional and deliberately outside the consent
          gate. Anonymous, session-scoped, no IP, no cookie — nothing to
          consent to. Declining GA must not silence these.
        */}
        <Analytics locale={typedLocale} />

        {/* GA: renders nothing until consent is explicitly granted. */}
        <GoogleAnalytics id={gaId} />

        <NextIntlClientProvider>
          {/* Skip link: first focusable element, visible only on focus. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-control focus:border focus:border-strong focus:bg-surface focus:px-4 focus:py-2 focus:text-ui focus:text-fg"
          >
            {ui.t("skip_to_content")}
          </a>

          <SiteHeader locale={typedLocale} />

          {/*
            <main> lives in the route-group layouts, not here. It used to wrap
            {children}, which put the (site) layout's footer INSIDE <main> —
            wrong semantically, and the reason the footer sat directly after the
            content instead of at the bottom of the viewport.
          */}
          {children}

          <ConsentBanner
            enabled={Boolean(gaId)}
            message={ui.t("consent_message")}
            accept={ui.t("consent_accept")}
            decline={ui.t("consent_decline")}
          />
        </NextIntlClientProvider>
    </>
  );
}
