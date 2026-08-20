import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ChapterSections } from "@/components/case-file/ChapterSections";
import { ProseSections } from "@/components/layout/ProseSections";
import { getChapter, listChapterParams } from "@/lib/content/chapters";
import { getPageSections } from "@/lib/content/pages";
import { dirForLocale } from "@/lib/content/types";
import { getUiStrings } from "@/lib/content/ui";
import { pageMetadata } from "@/lib/seo/metadata";
import { splitHeading } from "@/lib/utils/splitHeading";
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

  /*
   * TRIAL, 2026-08-21 — the two-size h1. See the h1 below for the token
   * choice. `tail` is null for a heading with no internal punctuation, and
   * that heading renders exactly as it did before this existed.
   */
  const { head, tail } = splitHeading(headline);

  /*
   * Sections are rendered in two runs so the decision cards keep their place in
   * the argument. `context` is the hinge: everything up to it is the setup, the
   * decisions are the turn, and the rest is the consequence.
   *
   * A chapter with sections but no `context` slot yields an empty lead and
   * renders everything after the decisions — the correct degenerate case rather
   * than a special one.
   */
  const hasSections = detail.sections.length > 0;


  /*
   * The `objective` slot is DROPPED, not rendered.
   *
   * `headline` above is `fields.objective` — the chapter's objective set as the
   * h1, which is the design. The slot carries the same sentence, so rendering
   * both printed the objective twice in a row, verbatim, under two identical
   * OBJECTIVE labels. Caught in the browser at /en; it is invisible in the DOM
   * checks because both copies are correct on their own.
   */
  const body = detail.sections.filter((s) => s.slot !== "objective");

  const contextAt = body.findIndex((s) => s.slot === "context");
  const splitAt = contextAt === -1 ? 0 : contextAt + 1;
  const leadSections = body.slice(0, splitAt);
  const restSections = body.slice(splitAt);

  /*
   * THE RAIL AND THE TWO-COLUMN GRID ARE ONE DECISION.
   *
   * They used to be two: the grid was applied whenever `kind === 'accessibility'`,
   * while the rail had its own separate test. When those two disagreed the grid
   * kept both of its tracks and the body — now the only child — landed in the
   * FIRST one, which is `16rem`. The page rendered its prose in a 248px column
   * at 1440px with two thirds of the width empty, and nothing errored.
   *
   * That is exactly what happened when this page's rail moved onto
   * `detail.sections`: the sync refuses this page, so `sections` is empty, the
   * rail disappeared and the grid did not. Deriving both from ONE list makes the
   * disagreement unrepresentable rather than merely fixed.
   *
   * The list follows whichever path is actually rendering, so it keeps working
   * when the page migrates onto the slot model.
   */
  const railItems = hasSections
    ? body
        .filter((sec) => sec.heading)
        .map((sec) => ({
          key: sec.id,
          href: `#${sec.slot}`,
          label: sec.heading as string,
          lang: sec.headingLang,
        }))
    : page.sections
        .filter((sec) => sec.kind !== "table" && sec.fields.heading)
        .map((sec) => ({
          key: sec.id,
          href: `#${sec.slug}`,
          label: sec.fields.heading as string,
          lang: undefined,
        }));

  const showRail = detail.kind === "accessibility" && railItems.length > 3;

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
            showRail ? "gap-14 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]" : undefined
          }
        >
          {/*
            The contents rail. Accessibility runs to thirteen numbered
            sections; the design gives it a sticky rail on wide screens that
            becomes a wrapping row on narrow ones. Comparison pages have four
            sections and get none.
          */}
          {showRail ? (
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
                {/*
                  Built from `railItems`, which follows whichever content path
                  is rendering. On the slot model the anchor is the slot name —
                  `#the-position` — stable across a re-sync and readable in the
                  address bar, where the heading-derived slug was neither.
                */}
                {railItems.map((item, i) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="flex gap-3 rounded-control py-2 text-body-sm text-fg-muted transition-colors hover:text-fg lg:px-3"
                    >
                      <span className="font-mono text-micro text-fg-dim">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="min-w-0"
                        lang={item.lang}
                        dir={item.lang ? dirForLocale(item.lang) : undefined}
                      >
                        {item.label}
                      </span>
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
            {/*
              Document pages read from the SLOT MODEL now (migrations 0035 and
              0038), not from `page_sections`. The layout above is unchanged —
              the container width, the two-column shell and the contents rail
              are all still the `isDocument` design. Only the content source
              moved, which is what brings the accessibility page's 36 figures
              with it.

              `page_sections` for these three page keys is retired rather than
              left in place: two representations of one page's prose diverge the
              moment either is edited, and the chapter route was their only
              reader.
            */}
            {hasSections ? (
              <ChapterSections sections={body} />
            ) : (
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
            )}
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

          {/*
            TWO SIZES IN ONE HEADING — a trial. The objective is a full
            sentence; the clause before its first punctuation mark keeps the
            title size and the rest of it drops one step.

            WHY `text-h2` FOR THE TAIL. It is the next step DOWN the DISPLAY
            ramp, so the tail is the same voice one step quieter rather than a
            second, smaller thing. The near-in-size reading tokens — `lead`,
            `statement` — were the obvious alternative and are wrong here:
            they take `--type-scale` (1.15 in Arabic) where `text-title` takes
            `--type-scale-display` (1.00), so the Arabic tail would sit 15%
            larger against its head than the English tail does and the
            treatment would mean something different in each language. On the
            display ramp head and tail hold the same ratio, ~0.73, at every
            viewport and in both scripts.

            It is a SIZE change and not a weight one, and that is forced:
            `:lang(ar) h1` runs weight 400 with `font-synthesis-weight: none`
            because LANTX ships a single weight. Arabic has no weight axis, so
            a treatment built on weight would be invisible on half the site.

            ONE <h1>, with the tail in a <span>. The heading stays one sentence
            to a screen reader and one entry in the document outline.
          */}
          <h1 className="mt-5 max-w-measure text-title text-fg">
            {tail ? (
              <>
                {head}{" "}
                <span className="text-h2">{tail}</span>
              </>
            ) : (
              headline
            )}
          </h1>

          {/*
            THE SLOT MODEL, WHERE IT EXISTS (migration 0035).

            A chapter that has sections renders them and nothing else: they
            already carry objective, context, evidence and result, PLUS the
            passages the flat fields had no key for and every figure on the
            page. Rendering both would print each of those passages twice.

            The fields remain the fallback for the nine chapters whose headings
            are not yet in `chapter_slot_aliases`. This is a rollout, not a
            switch, and the fallback is what keeps it from being one.

            Sections are split around the decision cards so the reading order
            still matches the page as written in Notion: the narrative runs up
            to and including `context`, the decisions are argued, and the rest
            of the chapter follows.
          */}
          {hasSections ? (
            <ChapterSections sections={leadSections} />
          ) : detail.fields.context ? (
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

          {hasSections ? <ChapterSections sections={restSections} /> : null}

          {/*
            Evidence. The design pairs prose with masked figures; `media` is
            empty, so only the prose renders — and only one chapter has it.
            No placeholder frames: an empty figure reads as a broken image.
          */}
          {!hasSections && detail.fields.evidence_note ? (
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

          {!hasSections && detail.fields.result ? (
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
