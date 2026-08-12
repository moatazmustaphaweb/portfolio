import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProseSections } from "@/components/layout/ProseSections";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Philosophy — docs-style, like a design system's Foundations page.
 *
 * The thesis is "to design is to build, not to draw", and the page is built to
 * be *cited*: numbered positions, stable anchors, one idea per section. That
 * is the docs convention and it is the right one here, because these sections
 * get linked to individually — a position held is a thing to point at, and a
 * position you cannot link to is a position nobody can quote back to you.
 *
 * Every section gets an `id` derived from its slug and a hover anchor, so any
 * paragraph of this page has a URL.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

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

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y">
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
        <h1 className="max-w-measure text-title text-fg">
          {ui.t("page_philosophy")}
        </h1>
      ) : null}

      <div className="mt-12 gap-16 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/*
          Contents. A docs page earns a sidebar the moment it has more sections
          than fit on a screen — this one has five, each a distinct position.
          Sticky on wide screens, a plain list on narrow ones.
        */}
        {sections.length > 1 ? (
          <nav
            aria-labelledby="contents-heading"
            className="mb-12 lg:sticky lg:top-24 lg:mb-0 lg:self-start"
          >
            <h2
              id="contents-heading"
              className="font-mono text-micro uppercase text-fg-dim"
            >
              {ui.t("page_philosophy")}
            </h2>
            <ol className="mt-4 flex flex-col gap-2">
              {sections.map((section, i) =>
                section.fields.heading ? (
                  <li key={section.id}>
                    <a
                      href={`#${section.slug}`}
                      className="flex gap-3 text-body-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      <span className="font-mono text-micro text-fg-dim">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{section.fields.heading}</span>
                    </a>
                  </li>
                ) : null,
              )}
            </ol>
          </nav>
        ) : null}

        <div className="min-w-0">
          {intro ? (
            <p className="max-w-measure whitespace-pre-line text-lead text-fg-body">
              {intro}
            </p>
          ) : null}

          {sections.map((section, i) =>
            section.fields.body ? (
              <section
                key={section.id}
                id={section.slug}
                className="mt-14 scroll-mt-24 first:mt-0"
              >
                {section.fields.heading ? (
                  <>
                    <p className="font-mono text-micro uppercase text-fg-dim">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mb-4 mt-2 max-w-measure text-h3 text-fg">
                      {/*
                        The heading links to itself — the docs convention for
                        "this is the citable unit".
                      */}
                      <a href={`#${section.slug}`} className="hover:text-accent">
                        {section.fields.heading}
                      </a>
                    </h2>
                  </>
                ) : null}
                <p className="max-w-measure whitespace-pre-line text-body text-fg-body">
                  {section.fields.body}
                </p>
              </section>
            ) : null,
          )}

          <nav className="mt-18 flex flex-wrap gap-3 border-t border-DEFAULT pt-8">
            {[
              { label: ui.t("page_systems"), href: `/${l}/systems` },
              { label: ui.t("page_work"), href: `/${l}/work` },
              { label: ui.t("page_about"), href: `/${l}/about` },
            ].map((link) =>
              link.label ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-control-h items-center rounded-control border border-DEFAULT px-4 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
                >
                  {link.label}
                </Link>
              ) : null,
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
