import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { ReadingProgress } from "@/components/case-file/ReadingProgress";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCaseFile, listCaseFileSlugs } from "@/lib/content/case-files";
import { listChapterBodies } from "@/lib/content/chapters";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale, TargetStatus } from "@/lib/content/types";

/**
 * Linear View — composed from `CaseLinear.dc.html`.
 *
 * The whole case file in one scroll, for the reader who has decided they are
 * interested and no longer wants to click, and for the one printing to PDF.
 *
 * Design decisions carried over:
 *  - A reading-progress hairline under the header. This is the only page long
 *    enough to warrant one.
 *  - Each chapter's h2 is its OBJECTIVE, matching the chapter page. The title
 *    rides above it as a mono "Chapter 01" label.
 *  - The decision is an accent INSET here, not the full card it gets on the
 *    chapter page — the linear read needs the beats to stay in proportion to
 *    one another rather than each shouting.
 *  - The results table is embedded at the end. A linear read that stops before
 *    the outcomes is not the whole case file.
 *  - A floating "back to the map" pill, because at 4,000 words the header is
 *    a long way up.
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

/** Same form-not-colour encoding as the full Results Table. */
const PILL: Record<TargetStatus, string> = {
  achieved: "border-fg bg-fg text-bg",
  missed: "border-dashed border-strong text-fg-muted",
  "not-measurable": "border-strong text-fg-muted",
};

export default async function LinearView({
  params,
}: {
  params: Promise<{ locale: string; caseFile: string }>;
}) {
  const { locale, caseFile } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [detail, chapters, ui] = await Promise.all([
    getCaseFile(caseFile, l),
    listChapterBodies(caseFile, l),
    getUiStrings(l),
  ]);
  if (!detail || !chapters) notFound();

  const caseTitle = detail.fields.title ?? caseFile;
  const chapterWord = ui.t("chapter");
  const sibling = detail.siblings[0];

  const statusLabel: Record<TargetStatus, string | undefined> = {
    achieved: ui.t("status_achieved"),
    missed: ui.t("status_missed"),
    "not-measurable": ui.t("status_not_measurable"),
  };

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto max-w-prose px-gutter py-section-y">
        <Breadcrumb
          locale={l}
          label={ui.t("breadcrumb_label")}
          crumbs={[
            { label: ui.t("home") ?? "", href: "/" },
            { label: ui.t("page_work") ?? "", href: "/work" },
            { label: caseTitle, href: `/work/${caseFile}` },
            { label: ui.t("linear_view") ?? "" },
          ]}
        />

        <header>
          {ui.t("case_file") ? (
            <p className="font-mono text-label uppercase text-fg-dim">
              {ui.t("case_file")}
            </p>
          ) : null}
          <h1 className="mt-4 max-w-measure text-title text-fg">{caseTitle}</h1>

          {detail.fields.thesis ? (
            <p className="mt-6 max-w-measure text-lead text-fg-body">
              {detail.fields.thesis}
            </p>
          ) : null}

          {/*
            The design puts a "four chapters · about 9 minutes" line here. Only
            the chapter count is rendered — see docs/status.md for why the
            minutes are omitted rather than estimated.
          */}
          {chapterWord && chapters.length > 0 ? (
            <p className="mt-5 font-mono text-meta text-fg-dim">
              {chapters.length} {chapterWord}
            </p>
          ) : null}
        </header>

        {/*
          The role statement stays prominent, not the design's mono caption —
          the correction Moataz made to CaseFile applies wherever the role
          appears, and someone arriving here from a shared link must not lose
          the one sentence that says what he personally did.
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

        {chapters.map((chapter, i) => {
          const number = String(i + 1).padStart(2, "0");
          const headline = chapter.fields.objective ?? chapter.fields.title;

          return (
            <article key={chapter.id} className="mt-18 border-t border-DEFAULT pt-10">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-micro uppercase text-fg-dim">
                  {chapterWord ? `${chapterWord} ` : ""}
                  {number}
                </span>
                {chapter.fields.title ? (
                  <span className="font-mono text-micro uppercase text-fg-dim">
                    · {chapter.fields.title}
                  </span>
                ) : null}
              </div>

              {/*
                h2, not h1 — the page has one h1 (the case file) and the
                chapters are its sections. Eight h1s reads as eight documents.
              */}
              {headline ? (
                <h2 className="mt-3 max-w-measure text-h2 text-fg">
                  <Link
                    href={`/${l}/work/${caseFile}/${chapter.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    {headline}
                  </Link>
                </h2>
              ) : null}

              {chapter.fields.context ? (
                <p className="mt-6 max-w-measure whitespace-pre-line text-body text-fg-body">
                  {chapter.fields.context}
                </p>
              ) : null}

              {chapter.decisions.map((decision) =>
                decision.fields.name ? (
                  <div
                    key={decision.id}
                    className="mt-6 border-s border-accent ps-5"
                  >
                    {ui.t("decision") ? (
                      <p className="font-mono text-micro uppercase text-fg-dim">
                        {ui.t("decision")}
                      </p>
                    ) : null}
                    <p className="mt-2 max-w-measure text-statement text-fg">
                      {decision.fields.name}
                    </p>
                    {decision.fields.body ? (
                      <p className="mt-3 max-w-measure whitespace-pre-line text-body text-fg-body">
                        {decision.fields.body}
                      </p>
                    ) : null}
                  </div>
                ) : null,
              )}

              {chapter.fields.result ? (
                <p className="mt-6 max-w-measure whitespace-pre-line text-body text-fg-muted">
                  {ui.t("result") ? (
                    <span className="font-mono text-micro uppercase text-fg-dim">
                      {ui.t("result")} ·{" "}
                    </span>
                  ) : null}
                  {chapter.fields.result}
                </p>
              ) : null}

              <Link
                href={`/${l}/work/${caseFile}/${chapter.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-ui text-fg-muted transition-colors hover:text-fg"
              >
                {ui.t("read_more")}
                <span aria-hidden="true" className="rtl:rotate-180">
                  →
                </span>
              </Link>
            </article>
          );
        })}

        {/* The outcomes belong to the linear read — it is the whole case file. */}
        {detail.targets.length > 0 ? (
          <section className="mt-18 border-t border-DEFAULT pt-10">
            {ui.t("results") ? (
              <h2 className="text-h2 text-fg">{ui.t("results")}</h2>
            ) : null}

            <div className="mt-6 overflow-x-auto rounded-panel border border-DEFAULT bg-surface">
              <table className="w-full border-collapse text-start">
                <thead>
                  <tr className="bg-surface-raised">
                    <th
                      scope="col"
                      className="px-5 py-3 text-start font-mono text-micro uppercase text-fg-muted"
                    >
                      {ui.t("target")}
                    </th>
                    <th
                      scope="col"
                      className="border-s border-DEFAULT px-5 py-3 text-start font-mono text-micro uppercase text-fg-muted"
                    >
                      {ui.t("outcome")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detail.targets.map((target) => {
                    const status = target.status as TargetStatus;
                    return (
                      <tr key={target.id} className="border-t border-DEFAULT align-top">
                        <th
                          scope="row"
                          className="px-5 py-4 text-start text-body-sm font-normal text-fg"
                        >
                          {target.fields.target}
                        </th>
                        <td className="border-s border-DEFAULT px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-pill border px-3 py-1 font-mono text-micro uppercase ${PILL[status]}`}
                          >
                            {statusLabel[status] ?? status}
                          </span>
                          {target.fields.note ? (
                            <span className="mt-2 block text-meta text-fg-muted">
                              {target.fields.note}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {ui.t("results_table") ? (
              <Link
                href={`/${l}/work/${caseFile}/results`}
                className="mt-4 inline-flex items-center gap-2 text-ui text-fg-muted transition-colors hover:text-fg"
              >
                {ui.t("results_table")}
                <span aria-hidden="true" className="rtl:rotate-180">
                  →
                </span>
              </Link>
            ) : null}
          </section>
        ) : null}

        {sibling?.title ? (
          <section className="mt-18">
            <Link
              href={`/${l}/work/${sibling.slug}`}
              className="block rounded-panel border border-strong bg-surface p-card-p transition-colors hover:border-fg"
            >
              {ui.t("sibling_case_files") ? (
                <span className="font-mono text-label uppercase text-fg-dim">
                  {ui.t("sibling_case_files")}
                </span>
              ) : null}
              <span className="mt-4 flex flex-wrap items-end gap-5">
                <span className="min-w-0 flex-1 text-h2 text-fg">{sibling.title}</span>
                <span aria-hidden="true" className="text-h3 text-fg rtl:rotate-180">
                  →
                </span>
              </span>
            </Link>
          </section>
        ) : null}

        <nav className="mt-18 flex flex-wrap items-center justify-between gap-4 border-t border-DEFAULT pt-8">
          <Link
            href={`/${l}/work/${caseFile}`}
            className="text-ui text-fg-muted transition-colors hover:text-fg"
          >
            <span aria-hidden="true" className="inline-block rtl:rotate-180">
              ←
            </span>{" "}
            {caseTitle}
          </Link>
          {ui.t("page_work") ? (
            <Link
              href={`/${l}/work`}
              className="rounded-control border border-DEFAULT px-4 py-2 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
            >
              {ui.t("page_work")}
            </Link>
          ) : null}
        </nav>
      </div>

      {/*
        The floating return-to-map pill. `position: fixed` with a logical
        inset so it lands bottom-right in English and bottom-left in Arabic.
      */}
      <Link
        href={`/${l}/work/${caseFile}`}
        className="fixed bottom-6 z-50 inline-flex h-control-h items-center gap-2 rounded-pill border border-strong bg-surface-raised px-5 text-ui text-fg-body shadow-none transition-colors hover:border-fg hover:text-fg ltr:right-6 rtl:left-6"
      >
        <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-accent" />
        {caseTitle}
      </Link>
    </>
  );
}
