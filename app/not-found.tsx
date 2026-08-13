import Link from "next/link";
import { getLocale } from "next-intl/server";

import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * 404 — composed from `NotFound.dc.html`.
 *
 * This is the root not-found boundary, and it is the reason `app/layout.tsx`
 * now exists. Before, an unmatched URL produced Next's built-in error shell:
 * no `lang`, no `dir`, no chrome, and none of this copy. The design was fine
 * the whole time; there was nowhere for it to render.
 *
 * The locale comes from `getLocale()` rather than route params — a not-found
 * boundary receives none — so an Arabic 404 is finally Arabic. That closes the
 * caveat that has been sitting in the route map since the page was scaffolded.
 *
 * Two ways out, as drawn: the work, and a way to report what broke. "No dead
 * ends" applies most on the page that is itself a dead end.
 */
export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const [ui, settings] = await Promise.all([
    getUiStrings(locale),
    getSettings(locale),
  ]);

  const name = settings.get("name");

  return (
    <>
      {/*
        A reduced header. The full SiteHeader lives in the locale layout, which
        is not above this boundary — and the design draws a simplified,
        non-sticky bar here anyway.
      */}
      <header className="border-b border-DEFAULT">
        <div className="mx-auto flex min-h-header-h max-w-container flex-wrap items-center gap-6 px-gutter">
          {name ? (
            <Link href={`/${locale}`} className="text-ui font-semibold text-fg">
              {name}
            </Link>
          ) : null}
          <nav className="flex flex-wrap items-center gap-5">
            {[
              { label: ui.t("page_work"), href: `/${locale}/work` },
              { label: ui.t("page_about"), href: `/${locale}/about` },
              { label: ui.t("page_contact"), href: `/${locale}/contact` },
            ].map((link) =>
              link.label ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-ui text-fg-muted transition-colors hover:text-fg"
                >
                  {link.label}
                </Link>
              ) : null,
            )}
          </nav>
        </div>
      </header>

      <main id="main" className="flex flex-1 items-center px-gutter py-section-y-hero">
        <div className="mx-auto w-full max-w-measure-lead">
          <p className="font-mono text-label uppercase text-fg-dim">404</p>

          {ui.t("not_found_title") ? (
            <h1 className="mt-5 max-w-measure text-h2 text-fg">
              {ui.t("not_found_title")}
            </h1>
          ) : null}

          {ui.t("not_found_body") ? (
            <p className="mt-5 max-w-measure text-body text-fg-muted">
              {ui.t("not_found_body")}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            {ui.t("not_found_cta") ? (
              <Link
                href={`/${locale}/work`}
                className="inline-flex h-control-h items-center gap-2 rounded-control border border-fg bg-fg px-5 text-ui text-bg transition-opacity hover:opacity-85"
              >
                {ui.t("not_found_cta")}
                <span aria-hidden="true" className="rtl:rotate-180">
                  →
                </span>
              </Link>
            ) : null}

            {/* The design's second CTA: tell me what broke. */}
            {ui.t("page_contact") ? (
              <Link
                href={`/${locale}/contact`}
                className="inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
              >
                {ui.t("page_contact")}
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
