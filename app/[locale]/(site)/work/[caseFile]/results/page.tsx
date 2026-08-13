import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCaseFile, listCaseFileSlugsWithTargets } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale, TargetStatus } from "@/lib/content/types";

/**
 * Results Table — composed from `CaseResults.dc.html`.
 *
 * The design's status encoding is adopted wholesale, and it is better than
 * what shipped before: **form carries the meaning, not colour.**
 *
 *   achieved        filled pill
 *   missed          dashed outline
 *   not-measurable  thin solid outline
 *
 * Plus a legend, so the encoding is stated rather than inferred. This reaches
 * decision 042's no-red conclusion by a stronger route — it survives
 * greyscale, colour-blindness, and a printed page, and the accent stays free
 * for its one job. The pills carry their label as text regardless, so nothing
 * depends on reading the shape.
 *
 * The count pills above the table ("4 achieved · 2 missed") are the design's
 * summary. They are computed, never authored, so they cannot contradict the
 * rows beneath them.
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
  return (await listCaseFileSlugsWithTargets()).map((caseFile) => ({ caseFile }));
}

/**
 * Status → pill form. Deliberately no colour beyond the ramp: `missed` is not
 * an error and `not-measurable` is a statement about evidence, not about the
 * work (decision 042).
 */
const PILL: Record<TargetStatus, string> = {
  achieved: "border-fg bg-fg text-bg",
  missed: "border-dashed border-strong text-fg-muted",
  "not-measurable": "border-strong text-fg-muted",
};

/** The legend's swatch mirrors the pill it explains. */
const SWATCH: Record<TargetStatus, string> = {
  achieved: "bg-fg border-fg",
  missed: "border-dashed border-strong",
  "not-measurable": "border-strong",
};

const ORDER: TargetStatus[] = ["achieved", "missed", "not-measurable"];

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
  if (detail.targets.length === 0) notFound();

  const caseTitle = detail.fields.title ?? caseFile;
  const label: Record<TargetStatus, string | undefined> = {
    achieved: ui.t("status_achieved"),
    missed: ui.t("status_missed"),
    "not-measurable": ui.t("status_not_measurable"),
  };

  /* The design's count pills. Computed from the rows, so they cannot drift. */
  const counts = ORDER.map((status) => ({
    status,
    n: detail.targets.filter((t) => t.status === status).length,
  })).filter((c) => c.n > 0);

  const sibling = detail.siblings[0];

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

      {/*
        The design's kicker is a label ("Case ending"); there is no such
        string, so the case title carries the slot — more informative, and it
        keeps the page identifiable now that the h1 is generic.
      */}
      <p className="font-mono text-label uppercase text-fg-dim">{caseTitle}</p>
      {ui.t("results") ? (
        <h1 className="mt-4 text-title text-fg">{ui.t("results")}</h1>
      ) : null}

      {counts.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-4">
          {counts.map((c) => (
            <span
              key={c.status}
              className="inline-flex items-center gap-2 rounded-pill border border-DEFAULT px-3 py-1 text-body-sm text-fg-muted"
            >
              <span className="font-mono text-meta text-fg">{c.n}</span>
              {label[c.status]}
            </span>
          ))}
        </div>
      ) : null}

      {/*
        A real <table> with `scope`, styled as the design's card. The design
        draws this with divs and `display: grid`; the element is kept because
        this is tabular data and a screen reader should be able to say
        "row 3 of 6, evidence: …". Same picture, correct semantics.
      */}
      <div className="mt-10 overflow-x-auto rounded-panel border border-DEFAULT bg-surface">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="bg-surface-raised">
              <th
                scope="col"
                className="px-6 py-3 text-start font-mono text-micro uppercase text-fg-muted"
              >
                {ui.t("target")}
              </th>
              <th
                scope="col"
                className="border-s border-DEFAULT px-6 py-3 text-start font-mono text-micro uppercase text-fg-muted"
              >
                {ui.t("outcome")}
              </th>
              <th
                scope="col"
                className="border-s border-DEFAULT px-6 py-3 text-start font-mono text-micro uppercase text-fg-muted"
              >
                {ui.t("evidence")}
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
                    className="max-w-measure px-6 py-5 text-start text-body font-normal text-fg"
                  >
                    {target.fields.target}
                  </th>
                  <td className="border-s border-DEFAULT px-6 py-5">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-pill border px-3 py-1 font-mono text-micro uppercase ${PILL[status]}`}
                    >
                      {label[status] ?? status}
                    </span>
                  </td>
                  <td className="max-w-measure border-s border-DEFAULT px-6 py-5 text-body-sm text-fg-muted">
                    {target.fields.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* The legend states the encoding rather than leaving it to be inferred. */}
      <ul className="mt-4 flex flex-wrap gap-5">
        {ORDER.filter((s) => label[s]).map((status) => (
          <li
            key={status}
            className="inline-flex items-center gap-2 text-meta text-fg-dim"
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-pill border ${SWATCH[status]}`}
            />
            {label[status]}
          </li>
        ))}
      </ul>

      {/*
        The design closes on a "Next case" card. Siblings are the real
        equivalent — a case file this one is meant to be read against
        (decision 039) — so the first one fills the slot when it exists.
      */}
      {sibling?.title ? (
        <section className="mt-18">
          <Link
            href={`/${l}/work/${sibling.slug}`}
            className="block rounded-panel border border-strong bg-surface p-card-p transition-colors hover:border-fg hover:bg-surface-raised"
          >
            {ui.t("sibling_case_files") ? (
              <span className="font-mono text-label uppercase text-fg-dim">
                {ui.t("sibling_case_files")}
              </span>
            ) : null}
            <span className="mt-4 flex flex-wrap items-end gap-6">
              <span className="min-w-0 flex-1 text-h2 text-fg">{sibling.title}</span>
              <span aria-hidden="true" className="text-h3 text-fg rtl:rotate-180">
                →
              </span>
            </span>
            {sibling.note ? (
              <span className="mt-4 block max-w-measure text-body text-fg-muted">
                {sibling.note}
              </span>
            ) : null}
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
  );
}
