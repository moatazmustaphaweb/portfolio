import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { EntryHandles } from "@/components/case-file/EntryHandles";
import { LivingMap } from "@/components/case-file/LivingMap";
import { OutcomeStrip } from "@/components/case-file/OutcomeStrip";
import { SiblingLinks } from "@/components/case-file/SiblingLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCaseFile, listCaseFileSlugs } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Case File Cover.
 *
 * The order is deliberate: title, thesis, THEN the role statement, then the
 * outcomes, then the map.
 *
 * The role statement sits at full body size directly under the thesis, not in
 * a caption or a metadata line. It is the fix for the problem this portfolio
 * exists to solve — case studies that read "we" throughout and leave the
 * evaluator unable to tell what this person actually did. "Sole designer on
 * the mobile product, end to end" is the single most load-bearing sentence on
 * the page and is typeset accordingly.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return (await listCaseFileSlugs()).map((caseFile) => ({ caseFile }));
}

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

      <header className="max-w-measure">
        {ui.t("case_file") ? (
          <p className="font-mono text-label uppercase text-fg-dim">
            {ui.t("case_file")}
          </p>
        ) : null}

        <h1 className="mt-4 text-title text-fg">{title}</h1>

        {detail.fields.thesis ? (
          <p className="mt-6 text-lead text-fg-body">{detail.fields.thesis}</p>
        ) : null}
      </header>

      {/*
        The role statement. Body size, own block, labelled — not a caption.
        A reader who takes only one sentence from this page should take this one.
      */}
      {detail.fields.role ? (
        <section className="mt-10 max-w-measure border-s border-strong ps-6">
          {ui.t("role_label") ? (
            <h2 className="font-mono text-micro uppercase text-fg-dim">
              {ui.t("role_label")}
            </h2>
          ) : null}
          <p className="mt-3 text-statement text-fg">{detail.fields.role}</p>
        </section>
      ) : null}

      {/*
        Outcomes, where they exist. Where they do not, this renders nothing —
        and the reflection below carries the honest account instead. A cover
        that states plainly it has no numbers is doing the right thing; the
        page must never paper over that with a manufactured strip.
      */}
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
        </section>
      ) : null}

      {/*
        Three ways in, above the map. The map answers "what is in here"; the
        handles answer "which of it is for me", and that question comes first.
      */}
      <EntryHandles
        handles={detail.handles}
        caseFileSlug={caseFile}
        locale={l}
        heading={ui.t("entry_handles_heading")}
      />

      {detail.fields.reflection ? (
        <section className="mt-14 max-w-measure">
          {ui.t("reflection") ? (
            <h2 className="mb-4 text-h3 text-fg">{ui.t("reflection")}</h2>
          ) : null}
          <p className="text-body text-fg-body">{detail.fields.reflection}</p>
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

          {ui.t("read_linear") ? (
            <Link
              href={`/${l}/work/${caseFile}/all`}
              className="mt-6 inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
            >
              {ui.t("read_linear")}
            </Link>
          ) : null}
        </section>
      ) : null}

      {/*
        Comparison and accessibility pages — reachable from the cover without
        entering the numbered sequence (amendment 033).
      */}
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
