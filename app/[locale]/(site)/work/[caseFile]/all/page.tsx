import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCaseFile, listCaseFileSlugs } from "@/lib/content/case-files";
import { listChapterBodies } from "@/lib/content/chapters";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Linear View — the whole case file on one page.
 *
 * It has no content of its own and no Notion row (the sync skips
 * "Linear View —" titles for exactly this reason): it is the same chapters the
 * cover links to, rendered in order with their bodies inline.
 *
 * It exists because the chapter-by-chapter read is the wrong shape for two
 * real readers: someone printing to PDF, and someone who has decided they are
 * interested and no longer wants to click. Both want the argument end to end.
 *
 * Only `kind = 'chapter'` appears. Comparison and accessibility pages are
 * reachable from the cover but are not part of the sequence (amendment 033);
 * the query enforces that rather than this page filtering, so the next surface
 * that reads chapters linearly inherits the rule.
 *
 * Each chapter keeps a deep link to its own page. The linear view is a way to
 * read, not a replacement for the addressable chapter.
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

  return (
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

      <header className="max-w-measure">
        {ui.t("linear_view") ? (
          <p className="font-mono text-label uppercase text-fg-dim">
            {ui.t("linear_view")}
          </p>
        ) : null}
        <h1 className="mt-4 text-title text-fg">{caseTitle}</h1>
        {detail.fields.thesis ? (
          <p className="mt-6 text-lead text-fg-body">{detail.fields.thesis}</p>
        ) : null}
      </header>

      {/*
        The role statement travels with the linear read. Someone who arrives
        here directly — from a shared link or a print — must not lose the one
        sentence that says what this person actually did.
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
        const title = chapter.fields.title ?? chapter.slug;

        return (
          <article
            key={chapter.id}
            className="mt-18 border-t border-DEFAULT pt-10"
          >
            <p className="font-mono text-micro uppercase text-fg-dim">
              {ui.t("chapter") ? `${ui.t("chapter")} ` : ""}
              {String(i + 1).padStart(2, "0")}
            </p>

            {/*
              h2 here, not h1. The page has one h1 — the case file — and the
              chapters are its sections. A linear view with eight h1s reads as
              eight documents to a screen reader.
            */}
            <h2 className="mt-3 max-w-measure text-h2 text-fg">
              <Link
                href={`/${l}/work/${caseFile}/${chapter.slug}`}
                className="transition-colors hover:text-accent"
              >
                {title}
              </Link>
            </h2>

            {chapter.fields.objective ? (
              <Beat label={ui.t("objective")} body={chapter.fields.objective} />
            ) : null}
            {chapter.fields.context ? (
              <Beat label={ui.t("context")} body={chapter.fields.context} />
            ) : null}

            {chapter.decisions.length > 0 ? (
              <div className="mt-8 flex flex-col gap-5">
                {chapter.decisions.map((decision) =>
                  decision.fields.name ? (
                    <div
                      key={decision.id}
                      className="rounded-panel border border-accent bg-surface p-card-p"
                    >
                      {ui.t("decision") ? (
                        <p className="font-mono text-micro uppercase text-accent">
                          {ui.t("decision")}
                        </p>
                      ) : null}
                      <h3 className="mt-3 max-w-measure text-statement text-fg">
                        {decision.fields.name}
                      </h3>
                      {decision.fields.body ? (
                        <p className="mt-4 max-w-measure whitespace-pre-line text-body text-fg-body">
                          {decision.fields.body}
                        </p>
                      ) : null}
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}

            {chapter.fields.result ? (
              <Beat label={ui.t("result")} body={chapter.fields.result} />
            ) : null}
          </article>
        );
      })}

      {/* No dead ends — including at the end of a long read. */}
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

/** One labelled block of chapter prose. */
function Beat({ label, body }: { label?: string; body: string }) {
  return (
    <section className="mt-8">
      {label ? (
        <h3 className="font-mono text-micro uppercase text-fg-dim">{label}</h3>
      ) : null}
      <p className="mt-3 max-w-measure whitespace-pre-line text-body text-fg-body">
        {body}
      </p>
    </section>
  );
}
