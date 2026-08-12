import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getChapter, listChapterParams } from "@/lib/content/chapters";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Chapter.
 *
 * Resolves both the chapter AND its parent, and 404s if either is missing or
 * unpublished — a published chapter under a draft case file stays unreachable,
 * matching the RLS policy rather than diverging from it.
 *
 * "No dead ends" is a non-negotiable, so every chapter ends with somewhere to
 * go: the next chapter, the previous one, and the cover. Those come resolved
 * from the query layer, so a chapter cannot render without them.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return listChapterParams();
}

export default async function Chapter({
  params,
}: {
  params: Promise<{ locale: string; caseFile: string; chapter: string }>;
}) {
  const { locale, caseFile, chapter } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [detail, ui] = await Promise.all([
    getChapter(caseFile, chapter, l),
    getUiStrings(l),
  ]);
  if (!detail) notFound();

  const caseTitle = detail.caseFile.fields.title ?? caseFile;
  const title = detail.fields.title ?? chapter;

  /** Objective → Context → Decisions → Result, the order a chapter argues in. */
  const beats: { label?: string; body?: string }[] = [
    { label: ui.t("objective"), body: detail.fields.objective },
    { label: ui.t("context"), body: detail.fields.context },
  ];

  return (
    <div className="mx-auto max-w-prose px-gutter py-section-y">
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

      <h1 className="max-w-measure text-title text-fg">{title}</h1>

      {beats.map((beat) =>
        beat.body ? (
          <section key={beat.label ?? beat.body.slice(0, 12)} className="mt-12">
            {beat.label ? (
              <h2 className="font-mono text-micro uppercase text-fg-dim">
                {beat.label}
              </h2>
            ) : null}
            <p className="mt-3 max-w-measure whitespace-pre-line text-body text-fg-body">
              {beat.body}
            </p>
          </section>
        ) : null,
      )}

      {/*
        Decisions — an ordered list, each with its own name (amendment 032).
        This is the most valuable content in a case study: the trade-off stated
        and defended. A chapter with three decisions shows three.
      */}
      {detail.decisions.length > 0 ? (
        <section className="mt-14 flex flex-col gap-6">
          {detail.decisions.map((decision) =>
            decision.fields.name ? (
              <article
                key={decision.id}
                className="rounded-panel border border-accent bg-surface p-card-p"
              >
                {ui.t("decision") ? (
                  <p className="font-mono text-micro uppercase text-accent">
                    {ui.t("decision")}
                  </p>
                ) : null}
                <h2 className="mt-3 max-w-measure text-statement text-fg">
                  {decision.fields.name}
                </h2>
                {decision.fields.body ? (
                  <p className="mt-4 max-w-measure whitespace-pre-line text-body text-fg-body">
                    {decision.fields.body}
                  </p>
                ) : null}
              </article>
            ) : null,
          )}
        </section>
      ) : null}

      {detail.fields.result ? (
        <section className="mt-14">
          {ui.t("result") ? (
            <h2 className="font-mono text-micro uppercase text-fg-dim">
              {ui.t("result")}
            </h2>
          ) : null}
          <p className="mt-3 max-w-measure whitespace-pre-line text-body text-fg-body">
            {detail.fields.result}
          </p>
        </section>
      ) : null}

      {/* No dead ends. Always a next step and always a way back. */}
      <nav className="mt-18 flex flex-wrap items-center justify-between gap-4 border-t border-DEFAULT pt-8">
        <Link
          href={`/${l}/work/${caseFile}`}
          className="text-ui text-fg-muted transition-colors hover:text-fg"
        >
          {ui.t("back_to_work") && caseTitle ? `← ${caseTitle}` : caseTitle}
        </Link>

        <div className="flex flex-wrap gap-3">
          {detail.prev ? (
            <Link
              href={`/${l}/work/${caseFile}/${detail.prev.slug}`}
              className="rounded-control border border-DEFAULT px-4 py-2 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
            >
              {ui.t("previous_chapter") ?? detail.prev.title}
            </Link>
          ) : null}

          {detail.next ? (
            <Link
              href={`/${l}/work/${caseFile}/${detail.next.slug}`}
              className="rounded-control border border-strong px-4 py-2 text-ui text-fg transition-colors hover:border-fg"
            >
              {detail.next.title ?? ui.t("next_chapter")}
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
