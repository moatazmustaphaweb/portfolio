import Link from "next/link";

import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * 404 — composed from `NotFound.dc.html`.
 *
 * Rendered from two places since task 003261026, when `<html>` moved into
 * `app/[locale]/layout.tsx` (next-intl's documented layout):
 *
 *  - `app/global-not-found.tsx` — an unmatched URL. It bypasses every layout,
 *    so it renders the reduced header the design draws.
 *  - `app/[locale]/not-found.tsx` — `notFound()` thrown inside a locale route.
 *    That renders INSIDE the locale layout, which already supplies the skip
 *    link and the full SiteHeader, so `header` is false there: two headers
 *    would be the alternative.
 *
 * Two ways out, as drawn: the work, and a way to report what broke. "No dead
 * ends" applies most on the page that is itself a dead end.
 */
export async function NotFoundView({
  locale,
  header,
}: {
  locale: Locale;
  header: boolean;
}) {
  const [ui, settings] = await Promise.all([
    getUiStrings(locale),
    getSettings(locale),
  ]);

  const name = settings.get("name");
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    /*
     * `lang` and `dir` repeated on the wrapper. `<html>` carries them too, but
     * on the global 404 the locale is inferred from the request rather than a
     * route param, and this keeps the content itself correctly marked either way.
     */
    <div lang={locale} dir={dir} className="flex flex-1 flex-col">
      {header ? (
        /*
          A reduced header. The full SiteHeader lives in the locale layout,
          which is not above the global 404 — and the design draws a
          simplified, non-sticky bar here anyway.
        */
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
      ) : null}

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
                className="inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg active:border-fg"
              >
                {ui.t("page_contact")}
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
