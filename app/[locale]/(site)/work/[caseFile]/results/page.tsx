import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCaseFile, listCaseFileSlugsWithTargets } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale, TargetStatus } from "@/lib/content/types";

/**
 * Results Table.
 *
 * The page the manifesto's fourth commitment lives on: **every declared target
 * closed** — achieved, missed, or not-measurable, with the evidence beside it.
 *
 * It is the opposite of the outcome strip on the cover. The strip says what
 * went well; this says what was promised and what became of it, including the
 * promises that cannot yet be judged. Six of Egypt's eleven target rows across
 * both case files are `not-measurable`, and that is the point rather than a
 * gap: a controlled release has no commercial launch to measure against, and
 * saying so is the claim.
 *
 * `not-measurable` is deliberately not styled as a failure. A target nobody
 * can measure yet is not a missed target, and colouring it like one would
 * misreport the work in the direction of self-criticism — which is no more
 * honest than the other direction.
 *
 * Route: `/work/[caseFile]/results`. A static segment beside `[chapter]`, so
 * it cannot be shadowed by a chapter slug. Notion models this page as a
 * "(close)" annotation on the cover's route rather than a route of its own,
 * which is why the sync's collision check keys on kind (decision: the results
 * table legitimately shares its parent's route).
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return (await listCaseFileSlugsWithTargets()).map((caseFile) => ({ caseFile }));
}

/**
 * Visual weight per status, within the one-accent system.
 *
 * There is no red. The palette has a single accent and the rule that colour is
 * never the sole indicator of a state, so the LABEL carries the meaning and
 * these only set emphasis: accent for closed, full-strength foreground for
 * missed, dimmed for not-measurable. A red "missed" would also be the loudest
 * thing on a page whose credibility comes from being even-handed.
 */
const STATUS_STYLE: Record<TargetStatus, string> = {
  achieved: "border-accent text-accent",
  missed: "border-strong text-fg",
  "not-measurable": "border-DEFAULT text-fg-dim",
};

export default async function ResultsTable({
  params,
}: {
  params: Promise<{ locale: string; caseFile: string }>;
}) {
  const { locale, caseFile } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [detail, ui] = await Promise.all([getCaseFile(caseFile, l), getUiStrings(l)]);
  if (!detail) notFound();

  /*
   * A case file with no declared targets has no results table. Neobiz's cover
   * declares its position in prose instead — designed and internally
   * validated, not built — and a page rendering an empty table under a
   * "Results" heading would read as a missing table rather than a deliberate
   * absence.
   */
  if (detail.targets.length === 0) notFound();

  const caseTitle = detail.fields.title ?? caseFile;
  const statusLabel: Record<TargetStatus, string | undefined> = {
    achieved: ui.t("status_achieved"),
    missed: ui.t("status_missed"),
    "not-measurable": ui.t("status_not_measurable"),
  };

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_work") ?? "", href: "/work" },
          { label: caseTitle, href: `/work/${caseFile}` },
          { label: ui.t("results_table") ?? "" },
        ]}
      />

      <header className="max-w-measure">
        {ui.t("results_table") ? (
          <p className="font-mono text-label uppercase text-fg-dim">
            {ui.t("results_table")}
          </p>
        ) : null}
        <h1 className="mt-4 text-title text-fg">{caseTitle}</h1>
      </header>

      {/*
        A real <table>: this is tabular data — target, status, evidence — and a
        screen reader should be able to say "row 3 of 6, evidence: …". A stack
        of divs would look identical and navigate far worse.

        It scrolls inside its own container rather than widening the page.
      */}
      <div className="mt-12 overflow-x-auto">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-strong">
              <th
                scope="col"
                className="py-3 pe-6 text-start font-mono text-micro uppercase text-fg-dim"
              >
                {ui.t("target")}
              </th>
              <th
                scope="col"
                className="py-3 pe-6 text-start font-mono text-micro uppercase text-fg-dim"
              >
                {ui.t("status_label") ?? ""}
              </th>
              <th
                scope="col"
                className="py-3 text-start font-mono text-micro uppercase text-fg-dim"
              >
                {ui.t("evidence")}
              </th>
            </tr>
          </thead>
          <tbody>
            {detail.targets.map((target) => {
              const status = target.status as TargetStatus;
              return (
                <tr key={target.id} className="border-b border-DEFAULT align-top">
                  <th
                    scope="row"
                    className="max-w-measure py-5 pe-6 text-start text-body font-normal text-fg"
                  >
                    {target.fields.target}
                  </th>
                  <td className="py-5 pe-6">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-control border px-3 py-1 font-mono text-micro uppercase ${STATUS_STYLE[status]}`}
                    >
                      {statusLabel[status] ?? status}
                    </span>
                  </td>
                  <td className="max-w-measure py-5 text-body-sm text-fg-muted">
                    {target.fields.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* No dead ends. */}
      <nav className="mt-18 flex flex-wrap items-center justify-between gap-4 border-t border-DEFAULT pt-8">
        <Link
          href={`/${l}/work/${caseFile}`}
          className="text-ui text-fg-muted transition-colors hover:text-fg"
        >
          ← {caseTitle}
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
  );
}
