import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { EntryHandles } from "@/components/case-file/EntryHandles";
import { LivingMap } from "@/components/case-file/LivingMap";
import { OutcomeStrip } from "@/components/case-file/OutcomeStrip";
import { SiblingLinks } from "@/components/case-file/SiblingLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CoverSections, splitCoverSections } from "@/components/case-file/CoverSections";
import { CloudinaryImage } from "@/components/media/CloudinaryImage";
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
    description: detail?.summary,
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

  /*
   * The opening passage and the role card share the two-column container; every
   * later slot stays full width below it. See splitCoverSections for why the
   * split is positional rather than by slot NAME — selecting `thesis` by name
   * would reverse Cervello's reading order.
   */
  const { lead, rest } = splitCoverSections(detail.sections);

  /*
   * What occupies the reserved third. Null today.
   *
   * ⚠️ THE BRIEF'S PREMISE WAS PARTLY WRONG and this is deliberately left for a
   * decision rather than resolved here: `media` is NOT empty and two covers DO
   * carry artwork — Egypt an inline SVG component, UAE a 2400×2400 Cloudinary
   * image. Both currently render as a FULL-WIDTH hero above this container.
   *
   * Moving them in here was not done, for two reasons. It is a visible change
   * to two working covers that was not asked for; and Egypt's cover is a
   * landscape system diagram that would be illegible at a third of the width,
   * where UAE's square image would suit it. Whether that existing artwork is
   * what the reserved column is FOR is a content decision — see docs/status.md.
   */
  const sideImage: React.ReactNode = null;
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

        No border and no frame. The artwork's grid texture fades to the page
        ground at its own edges, and a hairline drawn around that would
        contradict the fade — it would reassert exactly the edge the vignette
        exists to dissolve. The gallery thumbnail is the opposite case: it has
        no room for the texture, so there the frame IS the treatment.
      */}
      {detail.cover_kind === "component" && detail.cover_component ? (
        <div className="mt-8">{resolveCover(detail.cover_component, "cover")}</div>
      ) : detail.cover ? (
        /*
          The media branch. This page rendered a component cover and nothing
          else — no `else`, no import — so a case file on the Cloudinary path
          showed no cover at all, silently. That gap is what this closes.

          `hero` (w_1200, c_limit) rather than `card`: limit never crops, so
          the artwork arrives whole whatever its aspect. `priority` because
          this is the LCP image on the page.

          The wrapper carries no border or background of its own — a case file
          with neither cover kind falls through to null and the page closes up
          cleanly, with no empty frame left behind.
        */
        <div className="mt-8">
          <CloudinaryImage
            media={detail.cover}
            preset="hero"
            priority
            className="h-auto w-full"
          />
        </div>
      ) : null}

      {/*
        ── THE TWO-COLUMN CONTAINER ─────────────────────────────────────────
        
        The opening passage and the role card share a container two thirds
        wide; the remaining third is reserved for an image and spans both of
        them, because it is ONE grid cell beside a column that stacks two
        sections — not one cell each.

        `lg` (1024px) is the breakpoint. Below it, one column. See docs/status.md
        for the measurement behind that choice: at `md` the two-thirds column is
        480px against a 721px measure, which wraps prose far tighter than the
        measure allows for no gain.

        ⚠️ WHILE THE COLUMN IS EMPTY THE CONTAINER DOES NOT ACTIVATE. `sideImage`
        is null today, so this renders as one full-width column and the grid
        never engages. That is deliberate and is the recommendation in
        docs/status.md: prose is capped at `--measure-prose`, so at ≥1130px the
        paragraphs sit in exactly the same place either way, while below that a
        reserved-but-empty column would wrap them EARLIER than the measure
        permits — strictly worse reading, bought with dead space.

        No placeholder, no skeleton, no border. Empty means empty, so it renders
        nothing at all.

        The design also carries a mono meta line on the role card — "Product
        Design & Strategy · Mashreq Bank · 2023–2024". No such field exists; see
        docs/status.md, where this is the same missing content as the About
        timeline.
      */}
      {lead.length > 0 ? (
        <div
          className={
            sideImage
              ? "grid items-start gap-x-10 lg:grid-cols-3"
              : undefined
          }
        >
          {/*
            Logical by construction: CSS Grid places items along the INLINE
            axis, so under `dir="rtl"` the text column lands on the right and
            the image column on the left with no direction check anywhere.
          */}
          <div className={sideImage ? "lg:col-span-2" : undefined}>
            <CoverSections sections={lead} roleLabel={ui.t("role_label")} />
          </div>

          {sideImage ? <div className="mt-10 lg:mt-0">{sideImage}</div> : null}
        </div>
      ) : null}

      {/* map · what-it-is · status · why-it-matters — full width, below. */}
      <CoverSections sections={rest} roleLabel={ui.t("role_label")} />

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
