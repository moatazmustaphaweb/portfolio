import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PageShell } from "@/components/layout/PageShell";
import { getCaseFile, listCaseFileSlugs } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Case File Cover — SCAFFOLD.
 *
 * The route already resolves a real slug against the database: an unpublished
 * or unknown case file 404s rather than rendering an empty shell. That is the
 * part worth having early, because it is the part content will not change.
 *
 * Still to come (Phase 1): LivingMap, OutcomeStrip, EntryHandles, the sibling
 * link, and the thesis and role copy.
 */
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

  return (
    <PageShell
      locale={l}
      // The real title once synced; the slug only as a last resort, so a
      // freshly-synced case file with no translation is still navigable.
      title={detail.fields.title ?? caseFile}
      crumbs={[
        { label: ui.t("home") ?? "", href: "/" },
        { label: ui.t("page_work") ?? "", href: "/work" },
        { label: detail.fields.title ?? caseFile },
      ]}
    />
  );
}
