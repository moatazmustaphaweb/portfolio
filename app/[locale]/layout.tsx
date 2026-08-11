import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { Analytics } from "@/components/analytics/Analytics";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";
import { routing } from "@/i18n/routing";

import "../globals.css";

/*
 * Geist for everything, Geist Mono for metadata only. Self-hosted by next/font.
 *
 * Arabic currently falls back to Geist via --font-arabic, an explicit interim
 * (decision 020). That token is separate in globals.css so selecting a real
 * Arabic face later is a one-line change.
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
  const tagline = settings.get("tagline");
  const ogImage = settings.get("og_image");

  return {
    title: name,
    description: tagline,
    openGraph: {
      title: name,
      description: tagline,
      locale,
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
  };
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

  /*
   * dir is set once, here, from the locale segment. No component reads or sets
   * direction — everything below uses logical properties, so the whole tree
   * mirrors from this single attribute.
   */
  const dir = typedLocale === "ar" ? "rtl" : "ltr";

  // Read on the server so the value is inlined; the banner is suppressed
  // entirely when GA is not configured.
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang={typedLocale}
      dir={dir}
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>

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

          <main id="main" className="flex-1">
            {children}
          </main>

          <SiteFooter locale={typedLocale} />

          <ConsentBanner
            enabled={Boolean(gaId)}
            message={ui.t("consent_message")}
            accept={ui.t("consent_accept")}
            decline={ui.t("consent_decline")}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
