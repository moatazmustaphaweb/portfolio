import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { EntryHandles } from "@/components/case-file/EntryHandles";
import { LivingMap } from "@/components/case-file/LivingMap";
import { OutcomeStrip } from "@/components/case-file/OutcomeStrip";
import { SiblingLinks } from "@/components/case-file/SiblingLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { resolveCover } from "@/designs/registry";
import { getCaseFile, listCaseFileSlugs } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/content/types";

/**
 * Case File Cover — composed from the CORRECTED `CaseFile.dc.html`.
 *
 * The role statement now has the treatment the design gives it: a card with a
 * 4px accent spine on the leading edge, a mono label, and the statement at
 * 20–28px weight 500. It is the loudest element between the thesis and the
 * map, which is right — "Sole designer on the mobile product, end to end" is
 * the single most load-bearing sentence on this site.
 *
 * The living map stays a plain structural list (decision 023). The design's
 * SVG node diagram is Phase 2.
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
  return (await listCaseFileSlugs()).map((caseFile) => ({ caseFile }));
}

/** The thesis is the case file's own summary — the right preview description. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; caseFile: string }>;
}) {
  const { locale, caseFile } = await params;
  const l = locale as Locale;
  const detail = await getCaseFile(caseFile, l);
  return pageMetadata({
    locale: l,
    path: `/work/${caseFile}`,
    title: detail?.fields.title,
    description: detail?.fields.thesis,
  });
}

/** Maps a `case_files.domain` value to its `ui_strings` key. */
const DOMAIN_LABEL_KEYS: Record<string, string> = {
  banking: "domain_banking",
  "smart-things": "domain_smart_things",
  ai: "domain_ai",
  branding: "domain_branding",
};

export default async function CaseFileCover({
  params,
}: {
  params: Promise<{ locale: string; caseFile: string }>;
}) {
  const { locale, caseFile } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [detail, ui] = await Promise.all([getCaseFile(caseFile, l), getUiStrings(l)]);
  if (!detail) notFound();

  const title = detail.fields.title ?? caseFile;
  const domainLabel = ui.t(DOMAIN_LABEL_KEYS[detail.domain] ?? "");
  const kicker = [ui.t("case_file"), domainLabel].filter(Boolean).join(" · ");
  const firstChapter = detail.chapters[0];

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_work") ?? "", href: "/work" },
          { label: title },
        ]}
      />

      {/* The kicker is a bordered pill on the surface, not a bare label. */}
      {kicker ? (
        <p className="inline-flex rounded-pill border border-DEFAULT bg-surface px-3 py-1 font-mono text-label uppercase text-fg-muted">
          {kicker}
        </p>
      ) : null}

      <h1 className="mt-5 max-w-measure text-title text-fg">{title}</h1>

      {/*
        The cover, below the title, at the large size. The same component the
        gallery card renders — one artwork, two sizes, scaled by its viewBox
        rather than reflowed into a second composition.

        Bordered rather than bled: the artwork's own ground is
        --color-surface, so a hairline is what separates it from the page
        ground instead of a shadow.
      */}
      {detail.cover_kind === "component" && detail.cover_component ? (
        <div className="mt-8 overflow-hidden rounded-panel border border-DEFAULT">
          {resolveCover(detail.cover_component, "cover")}
        </div>
      ) : null}

      {detail.fields.thesis ? (
        <p className="mt-6 max-w-measure text-lead text-fg-body">
          {detail.fields.thesis}
        </p>
      ) : null}

      {/*
        The role card. The accent spine is `w-1` (4px) — a graphic element,
        not a border, so it is exempt from the one-stroke-weight rule the way
        the design treats it.

        The design also carries a mono meta line here — "Product Design &
        Strategy · Mashreq Bank · 2023–2024". No such field exists; see
        docs/status.md, where this is the same missing content as the About
        timeline.
      */}
      {detail.fields.role ? (
        <section className="mt-10 flex max-w-measure-lead items-stretch overflow-hidden rounded-panel border border-strong bg-surface">
          <div aria-hidden="true" className="w-1 shrink-0 bg-accent" />
          <div className="flex flex-col gap-3 p-card-p">
            {ui.t("role_label") ? (
              <span className="font-mono text-label uppercase text-fg-dim">
                {ui.t("role_label")}
              </span>
            ) : null}
            <p className="text-h3 text-fg">{detail.fields.role}</p>
          </div>
        </section>
      ) : null}

      {/* The metric grid. Empty for a case file that claims no numbers. */}
      {detail.outcomes.length > 0 ? (
        <section className="mt-14">
          {ui.t("results") ? (
            <h2 className="mb-5 text-h3 text-fg">{ui.t("results")}</h2>
          ) : null}
          <OutcomeStrip
            outcomes={detail.outcomes}
            statusLabels={{
              projected: ui.t("status_projected"),
              achieved: ui.t("status_achieved"),
              "not-measurable": ui.t("status_not_measurable"),
            }}
          />
          {detail.targets.length > 0 && ui.t("results_table") ? (
            <Link
              href={`/${l}/work/${caseFile}/results`}
              className="mt-5 inline-flex items-center gap-2 text-ui text-fg-muted transition-colors hover:text-fg"
            >
              {ui.t("results_table")}
              <span aria-hidden="true" className="rtl:rotate-180">
                →
              </span>
            </Link>
          ) : null}
        </section>
      ) : null}

      <EntryHandles
        handles={detail.handles}
        caseFileSlug={caseFile}
        locale={l}
        heading={ui.t("entry_handles_heading")}
      />

      {/* The design puts the reflection in a bordered card. */}
      {detail.fields.reflection ? (
        <section className="mt-14 max-w-measure-lead rounded-panel border border-DEFAULT bg-surface p-card-p">
          {ui.t("reflection") ? (
            <h2 className="font-mono text-label uppercase text-fg-dim">
              {ui.t("reflection")}
            </h2>
          ) : null}
          <p className="mt-4 whitespace-pre-line text-body text-fg-body">
            {detail.fields.reflection}
          </p>
        </section>
      ) : null}

      {detail.chapters.length > 0 ? (
        <section className="mt-14">
          <LivingMap
            chapters={detail.chapters}
            caseFileSlug={caseFile}
            grammar={detail.grammar}
            locale={l}
            chapterLabel={ui.t("chapter")}
          />

          {/*
            The design's dual CTA: enter the sequence, or read it straight
            through. Primary is the first chapter — "take the journey".
          */}
          <div className="mt-6 flex flex-wrap gap-3">
            {firstChapter ? (
              <Link
                href={`/${l}/work/${caseFile}/${firstChapter.slug}`}
                className="inline-flex h-control-h items-center gap-2 rounded-control border border-fg bg-fg px-5 text-ui text-bg transition-opacity hover:opacity-85"
              >
                {firstChapter.fields.title ?? ui.t("chapter")}
                <span aria-hidden="true" className="rtl:rotate-180">
                  →
                </span>
              </Link>
            ) : null}
            {ui.t("read_linear") ? (
              <Link
                href={`/${l}/work/${caseFile}/all`}
                className="inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
              >
                {ui.t("read_linear")}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {detail.pages.length > 0 ? (
        <section className="mt-10 flex flex-wrap gap-3">
          {detail.pages.map((page) =>
            page.fields.title ? (
              <Link
                key={page.id}
                href={`/${l}/work/${caseFile}/${page.slug}`}
                className="rounded-control border border-DEFAULT px-4 py-2 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
              >
                {page.fields.title}
              </Link>
            ) : null,
          )}
        </section>
      ) : null}

      <SiblingLinks
        siblings={detail.siblings}
        locale={l}
        heading={ui.t("sibling_case_files")}
      />
    </div>
  );
}
