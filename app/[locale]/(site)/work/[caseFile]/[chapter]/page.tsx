import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProseSections } from "@/components/layout/ProseSections";
import { getChapter, listChapterParams } from "@/lib/content/chapters";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/content/types";

/**
 * Chapter — composed from `CaseChapter.dc.html`.
 *
 * The design's central move: **the h1 is the OBJECTIVE, not the chapter
 * title.** A chapter is an argument, and its headline is the thing it set out
 * to do. The title survives in the breadcrumb, where the design puts it.
 *
 * Beats run Objective → Context → Decision → Evidence → Result, with the
 * decision in an accent-bordered card carrying a filled accent pill. That card
 * is the loudest element on the page by design: the decision is the most
 * valuable content in a case study.
 *
 * Comparison and accessibility pages take the `isDocument` branch instead —
 * they have their own designs and their own content shape.
 *
 * ⚠️ Four designed elements have no data and are NOT rendered as empty
 * scaffolding — see docs/status.md for the full list. In short: the decision
 * card's "What it cost / What it bought" grid, the feature strip, the evidence
 * figures, and the closing metric grid all describe fields that do not exist
 * in the schema or rows that are empty.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

/*
 * Unknown params 404 through the not-found boundary instead of rendering the
 * segment and calling notFound() inside it.
 *
 * That distinction is the whole bug: a runtime notFound() from within a
 * rendered dynamic segment resolved to Next's built-in error shell — no lang,
 * no dir, no chrome — while an unmatched ROUTE resolves to app/not-found.tsx.
 * Every published slug is in generateStaticParams already, so nothing
 * reachable is lost; a draft slug like /work/east becomes a proper 404.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return listChapterParams();
}

/**
 * The objective is the chapter's headline, so it is the title; the context is
 * its opening argument, so it is the description.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; caseFile: string; chapter: string }>;
}) {
  const { locale, caseFile, chapter } = await params;
  const l = locale as Locale;
  const detail = await getChapter(caseFile, chapter, l);
  return pageMetadata({
    locale: l,
    path: `/work/${caseFile}/${chapter}`,
    title: detail?.fields.title,
    description: detail?.fields.objective ?? detail?.fields.context,
  });
}

export default async function Chapter({
  params,
}: {
  params: Promise<{ locale: string; caseFile: string; chapter: string }>;
}) {
  const { locale, caseFile, chapter } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [detail, ui, page] = await Promise.all([
    getChapter(caseFile, chapter, l),
    getUiStrings(l),
    getPageSections(`work/${caseFile}/${chapter}`, l),
  ]);
  if (!detail) notFound();

  const isDocument = detail.kind !== "chapter";
  const caseTitle = detail.caseFile.fields.title ?? caseFile;
  const title = detail.fields.title ?? chapter;

  /*
   * The design's h1. Falls back to the title when a chapter has no objective —
   * 10 of 13 have one, and a headingless page is not an option.
   */
  const headline = detail.fields.objective ?? title;

  /* "Chapter 1 of 4", from the ui_strings template. */
  const { current, total } = detail.position;
  const progress =
    !isDocument && current > 0 && total > 1
      ? (ui.t("chapter_of") ?? "")
          .replace("{current}", String(current))
          .replace("{total}", String(total))
      : null;

  return (
    <div
      className={`mx-auto px-gutter py-section-y ${
        isDocument ? "max-w-container" : "max-w-prose"
      }`}
    >
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_work") ?? "", href: "/work" },
          { label: caseTitle, href: `/work/${caseFile}` },
          { label: title },
        ]}
      />

      {isDocument ? (
        <div
          className={
            detail.kind === "accessibility"
              ? "gap-14 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"
              : undefined
          }
        >
          {/*
            The contents rail. Accessibility runs to thirteen numbered
            sections; the design gives it a sticky rail on wide screens that
            becomes a wrapping row on narrow ones. Comparison pages have four
            sections and get none.
          */}
          {detail.kind === "accessibility" && page.sections.length > 3 ? (
            <nav
              aria-labelledby="contents-heading"
              className="mb-10 lg:sticky lg:top-18 lg:mb-0 lg:self-start lg:border-e lg:border-DEFAULT lg:pe-6"
            >
              <h2
                id="contents-heading"
                className="font-mono text-micro uppercase text-fg-dim"
              >
                {title}
              </h2>
              <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 lg:flex-col lg:gap-0">
                {page.sections
                  .filter((s) => s.kind !== "table" && s.fields.heading)
                  .map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.slug}`}
                        className="flex gap-3 rounded-control py-2 text-body-sm text-fg-muted transition-colors hover:text-fg lg:px-3"
                      >
                        <span className="font-mono text-micro text-fg-dim">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">{s.fields.heading}</span>
                      </a>
                    </li>
                  ))}
              </ol>
            </nav>
          ) : null}

          <div className="min-w-0">
            {ui.t("case_file") ? (
              <p className="font-mono text-label uppercase text-fg-dim">{caseTitle}</p>
            ) : null}
            <h1 className="mt-4 max-w-measure text-title text-fg">{title}</h1>
            <ProseSections
              intro={page.intro}
              sections={page.sections}
              variant={
                detail.kind === "comparison"
                  ? "comparison"
                  : detail.kind === "accessibility"
                    ? "accessibility"
                    : "plain"
              }
            />
          </div>
        </div>
      ) : (
        <>
          {/*
            Label row: what this is on one side, where you are on the other.
            The dashes are `h-px` — the system has one stroke weight, and the
            design's 2px has no token.
          */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {ui.t("objective") ? (
              <span className="font-mono text-label uppercase text-fg-dim">
                {ui.t("objective")}
              </span>
            ) : null}

            {progress ? (
              <div className="flex shrink-0 items-center gap-3">
                <span className="whitespace-nowrap font-mono text-label text-fg-dim">
                  {progress}
                </span>
                <span aria-hidden="true" className="flex shrink-0 gap-1">
                  {Array.from({ length: total }, (_, i) => (
                    <span
                      key={i}
                      className={`h-px w-4 ${
                        i + 1 === current ? "bg-fg" : "bg-border-strong"
                      }`}
                    />
                  ))}
                </span>
              </div>
            ) : null}
          </div>

          <h1 className="mt-5 max-w-measure text-title text-fg">{headline}</h1>

          {detail.fields.context ? (
            <section className="mt-14 border-t border-DEFAULT pt-8">
              {ui.t("context") ? (
                <h2 className="mb-4 font-mono text-label uppercase text-fg-dim">
                  {ui.t("context")}
                </h2>
              ) : null}
              <p className="max-w-measure whitespace-pre-line text-body text-fg-body">
                {detail.fields.context}
              </p>
            </section>
          ) : null}

          {/*
            The decision card. Accent border, filled accent pill, and the
            decision NAME set as a statement — the design's largest body
            element after the h1.
          */}
          {detail.decisions.length > 0 ? (
            <div className="mt-8 flex flex-col gap-6">
              {detail.decisions.map((decision) =>
                decision.fields.name ? (
                  <section
                    key={decision.id}
                    className="rounded-panel border border-accent bg-surface p-card-p"
                  >
                    {ui.t("decision") ? (
                      <p className="inline-flex rounded-pill bg-accent px-3 py-1 font-mono text-label uppercase text-accent-fg">
                        {ui.t("decision")}
                      </p>
                    ) : null}
                    <h2 className="mt-5 max-w-measure text-h3 text-fg">
                      {decision.fields.name}
                    </h2>
                    {decision.fields.body ? (
                      <p className="mt-5 max-w-measure whitespace-pre-line text-body text-fg-body">
                        {decision.fields.body}
                      </p>
                    ) : null}
                  </section>
                ) : null,
              )}
            </div>
          ) : null}

          {/*
            Evidence. The design pairs prose with masked figures; `media` is
            empty, so only the prose renders — and only one chapter has it.
            No placeholder frames: an empty figure reads as a broken image.
          */}
          {detail.fields.evidence_note ? (
            <section className="mt-14 border-t border-DEFAULT pt-8">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
                {ui.t("evidence") ? (
                  <h2 className="font-mono text-label uppercase text-fg-dim">
                    {ui.t("evidence")}
                  </h2>
                ) : null}
                {detail.caseFile.nda && ui.t("nda_label") ? (
                  <span className="rounded-pill border border-DEFAULT px-3 py-1 font-mono text-micro uppercase text-fg-dim">
                    {ui.t("nda_label")}
                  </span>
                ) : null}
              </div>
              <p className="max-w-measure whitespace-pre-line text-body text-fg-muted">
                {detail.fields.evidence_note}
              </p>
            </section>
          ) : null}

          {detail.fields.result ? (
            <section className="mt-14 border-t border-DEFAULT pt-8">
              {ui.t("result") ? (
                <h2 className="mb-4 font-mono text-label uppercase text-fg-dim">
                  {ui.t("result")}
                </h2>
              ) : null}
              {/* The design sets the result as a statement, not body copy. */}
              <p className="max-w-measure whitespace-pre-line text-statement text-fg">
                {detail.fields.result}
              </p>
            </section>
          ) : null}
        </>
      )}

      {/*
        Onward. The design draws a full-width next-chapter card carrying the
        next objective; prev is kept as a quiet link beside it because "no
        dead ends" is a non-negotiable and the design's header back-button is
        our breadcrumb.
      */}
      <nav className="mt-18 flex flex-col gap-6 border-t border-DEFAULT pt-8">
        {detail.next ? (
          <Link
            href={`/${l}/work/${caseFile}/${detail.next.slug}`}
            className="flex items-center gap-5 rounded-panel border border-DEFAULT bg-surface p-card-p transition-colors hover:border-strong hover:bg-surface-raised"
          >
            <span className="flex flex-col gap-2">
              {ui.t("next_chapter") ? (
                <span className="font-mono text-micro uppercase text-fg-dim">
                  {ui.t("next_chapter")}
                </span>
              ) : null}
              <span className="max-w-measure text-statement text-fg">
                {detail.next.title}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="ms-auto text-h3 text-fg-muted rtl:rotate-180"
            >
              →
            </span>
          </Link>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${l}/work/${caseFile}`}
            className="text-ui text-fg-muted transition-colors hover:text-fg"
          >
            <span aria-hidden="true" className="inline-block rtl:rotate-180">
              ←
            </span>{" "}
            {caseTitle}
          </Link>

          {detail.prev ? (
            <Link
              href={`/${l}/work/${caseFile}/${detail.prev.slug}`}
              className="text-ui text-fg-muted transition-colors hover:text-fg"
            >
              {ui.t("previous_chapter") ?? detail.prev.title}
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
