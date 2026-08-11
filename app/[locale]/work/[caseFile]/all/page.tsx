import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PageShell } from "@/components/layout/PageShell";
import { getCaseFile, listCaseFileSlugs } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Linear View — SCAFFOLD.
 *
 * The whole case file on one page. It has no content of its own and no Notion
 * row (the sync skips "Linear View —" titles for exactly this reason): it
 * renders the same chapters the cover links to, in order.
 *
 * The chapter list is already real, so this is navigable now.
 */
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

  const [detail, ui] = await Promise.all([getCaseFile(caseFile, l), getUiStrings(l)]);
  if (!detail) notFound();

  const caseTitle = detail.fields.title ?? caseFile;

  return (
    <PageShell
      locale={l}
      title={ui.t("linear_view")}
      crumbs={[
        { label: ui.t("home") ?? "", href: "/" },
        { label: ui.t("page_work") ?? "", href: "/work" },
        { label: caseTitle, href: `/work/${caseFile}` },
        { label: ui.t("linear_view") ?? "" },
      ]}
    >
      {/*
        Chapters in order. Real data — this is the one stub that already shows
        synced content, which makes it the fastest way to see whether a sync
        landed.
      */}
      {detail.chapters.length > 0 ? (
        <ol className="mt-10 flex flex-col gap-3">
          {detail.chapters.map((c, i) => (
            <li key={c.id}>
              <span className="font-mono text-micro uppercase text-fg-dim">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="ms-3 text-body text-fg-body">
                {c.fields.title ?? c.slug}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </PageShell>
  );
}
