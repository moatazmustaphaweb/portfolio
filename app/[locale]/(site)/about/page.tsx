import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/content/types";
import { dirForLocale } from "@/lib/content/types";

/**
 * About — composed from `About.dc.html`.
 *
 * The design opens with a **statement, not the word "About"**: a mono kicker,
 * then a positioning sentence as the h1. The real intro already reads exactly
 * that way ("I'm here to make things easier for people."), so its first line
 * takes the h1 slot and the rest becomes the lede. That assigns existing
 * content to designed slots; it does not rewrite it.
 *
 * The chronology is the argument, so the section order from Notion is the
 * order here: Now → Before → The Artist's Book → What that year taught me.
 *
 * ⚠️ The design's **career timeline** (years · role · place) is not built:
 * there is no dates-or-employers content anywhere in the database. It is the
 * one designed component whose absence a reader actually notices — see
 * docs/status.md.
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
    getPageSections("about", l),
    getUiStrings(l),
  ]);
  return pageMetadata({
    locale: l,
    path: "/about",
    title: ui.t("page_about"),
    description: intro,
  });
}

/**
 * Split a lede into its opening statement and the rest.
 *
 * Only promotes the first block to an h1 when it is short enough to set as
 * one. A 300-character paragraph at title size is not a headline, it is a
 * wall, so in that case the page keeps its plain title and the whole lede
 * stays body copy.
 */
function splitLede(intro?: string): { headline?: string; rest?: string } {
  if (!intro) return {};
  const [first, ...others] = intro.split("\n\n");
  if (!first || first.length > 120) return { rest: intro };
  return { headline: first, rest: others.join("\n\n") || undefined };
}

export default async function About({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [{ intro, sections }, ui] = await Promise.all([
    getPageSections("about", l),
    getUiStrings(l),
  ]);

  const { headline, rest } = splitLede(intro);

  const onward = [
    { label: ui.t("page_philosophy"), href: `/${l}/about/philosophy` },
    { label: ui.t("page_work"), href: `/${l}/work` },
    { label: ui.t("page_systems"), href: `/${l}/systems` },
    { label: ui.t("page_contact"), href: `/${l}/contact` },
  ].filter((x) => x.label);

  return (
    <div className="mx-auto max-w-prose px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_about") ?? "" },
        ]}
      />

      {ui.t("page_about") ? (
        <p className="font-mono text-label uppercase text-fg-dim">
          {ui.t("page_about")}
        </p>
      ) : null}

      <h1 className="mt-4 max-w-measure text-title text-fg">
        {headline ?? ui.t("page_about")}
      </h1>

      {rest ? (
        <p className="mt-6 max-w-measure whitespace-pre-line text-lead text-fg-body">
          {rest}
        </p>
      ) : null}

      {sections.map((section) =>
        section.fields.body ? (
          <section key={section.id} className="mt-14 border-t border-DEFAULT pt-10">
            {section.fields.heading ? (
              <h2
                className="mb-4 max-w-measure text-h3 text-fg"
                lang={section.fieldLocales.heading}
                dir={section.fieldLocales.heading ? dirForLocale(section.fieldLocales.heading) : undefined}
              >
                {section.fields.heading}
              </h2>
            ) : null}
            <p
              className="max-w-measure whitespace-pre-line text-body text-fg-body"
              lang={section.fieldLocales.body}
              dir={section.fieldLocales.body ? dirForLocale(section.fieldLocales.body) : undefined}
            >
              {section.fields.body}
            </p>
          </section>
        ) : null,
      )}

      {/*
        The design's sub-page grid. Cards rather than the plain buttons that
        were here before — but with names only: the design gives each card a
        descriptive line, and no such content exists.
      */}
      {onward.length > 0 ? (
        <nav aria-label={ui.t("nav_onward")} className="mt-18 border-t border-DEFAULT pt-10">
          <ul className="grid gap-3 sm:grid-cols-2">
            {onward.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-panel border border-DEFAULT bg-surface p-card-p transition-colors hover:border-strong hover:bg-surface-raised"
                >
                  <span className="text-statement text-fg">{link.label}</span>
                  <span
                    aria-hidden="true"
                    className="ms-auto text-ui text-fg-dim rtl:rotate-180"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
