import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/content/types";
import { dirForLocale } from "@/lib/content/types";

/**
 * Philosophy — composed from `Philosophy.dc.html`.
 *
 * Two corrections to what shipped before, both from the design:
 *
 * 1. **The h1 is the thesis, not the word "Philosophy".** The word belongs in
 *    the breadcrumb and the kicker. "To design is to build, not to draw" is
 *    the page, and setting it at title size is the whole point of it.
 * 2. **No contents sidebar.** I invented one here; the design puts a docs
 *    sidebar on Systems and leaves this page a single 820px column of
 *    numbered principles. The numbering carries the structure instead.
 *
 * Anchors are kept on every section — they are not in the design, but a
 * position you cannot link to is a position nobody can quote back at you, and
 * they cost nothing visually.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

/**
 * The page's own lede becomes its preview description — the first real
 * sentence of the page, not the site-wide tagline.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const [{ intro }, ui] = await Promise.all([
    getPageSections("about/philosophy", l),
    getUiStrings(l),
  ]);
  return pageMetadata({
    locale: l,
    path: "/about/philosophy",
    title: ui.t("page_philosophy"),
    description: intro,
  });
}

export default async function Philosophy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [{ intro, sections }, ui] = await Promise.all([
    getPageSections("about/philosophy", l),
    getUiStrings(l),
  ]);

  /*
   * The first section IS the thesis — it is the one whose heading states the
   * position the rest of the page follows from. Taking it positionally rather
   * than by heading text means a rewrite in Notion cannot break this.
   */
  const [thesis, ...principles] = sections;

  return (
    <div className="mx-auto max-w-prose px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_about") ?? "", href: "/about" },
          { label: ui.t("page_philosophy") ?? "" },
        ]}
      />

      {ui.t("page_philosophy") ? (
        <p className="font-mono text-label uppercase text-fg-dim">
          {ui.t("page_philosophy")}
        </p>
      ) : null}

      {thesis?.fields.heading ? (
        <h1
          id={thesis.slug}
          className="mt-4 max-w-measure scroll-mt-18 text-title text-fg"
          lang={thesis.fieldLocales.heading}
          dir={thesis.fieldLocales.heading ? dirForLocale(thesis.fieldLocales.heading) : undefined}
        >
          {thesis.fields.heading}
        </h1>
      ) : null}

      {intro ? (
        <p className="mt-6 max-w-measure whitespace-pre-line text-lead text-fg-body">
          {intro}
        </p>
      ) : null}

      {thesis?.fields.body ? (
        <p
          className="mt-6 max-w-measure whitespace-pre-line text-body text-fg-body"
          lang={thesis.fieldLocales.body}
          dir={thesis.fieldLocales.body ? dirForLocale(thesis.fieldLocales.body) : undefined}
        >
          {thesis.fields.body}
        </p>
      ) : null}

      {/*
        The principles. A flat numbered list: number in its own column, name,
        body. No card, no border per item — the hairline between them is the
        only separation the design allows.
      */}
      {principles.length > 0 ? (
        <section className="mt-18">
          {principles.map((principle, i) =>
            principle.fields.body ? (
              <article
                key={principle.id}
                id={principle.slug}
                className="flex scroll-mt-18 flex-wrap items-start gap-6 border-t border-DEFAULT py-10"
              >
                <span className="pt-1 font-mono text-label text-fg-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  {principle.fields.heading ? (
                    <h2
                      className="max-w-measure text-h3 text-fg"
                      lang={principle.fieldLocales.heading}
                      dir={
                        principle.fieldLocales.heading
                          ? dirForLocale(principle.fieldLocales.heading)
                          : undefined
                      }
                    >
                      <a href={`#${principle.slug}`} className="hover:text-accent">
                        {principle.fields.heading}
                      </a>
                    </h2>
                  ) : null}
                  <p
                    className="mt-3 max-w-measure whitespace-pre-line text-body text-fg-body"
                    lang={principle.fieldLocales.body}
                    dir={principle.fieldLocales.body ? dirForLocale(principle.fieldLocales.body) : undefined}
                  >
                    {principle.fields.body}
                  </p>
                </div>
              </article>
            ) : null,
          )}
        </section>
      ) : null}

      <nav className="flex flex-wrap gap-6 border-t border-DEFAULT pt-8">
        {[
          { label: ui.t("page_work"), href: `/${l}/work` },
          { label: ui.t("page_systems"), href: `/${l}/systems` },
          { label: ui.t("page_about"), href: `/${l}/about` },
        ].map((link) =>
          link.label ? (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 text-ui text-fg-muted transition-colors hover:text-fg"
            >
              {link.label}
              <span aria-hidden="true" className="rtl:rotate-180">
                →
              </span>
            </Link>
          ) : null,
        )}
      </nav>
    </div>
  );
}
