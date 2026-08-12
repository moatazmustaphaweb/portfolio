import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PageShell } from "@/components/layout/PageShell";
import { getChapter, listChapterParams } from "@/lib/content/chapters";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Chapter — SCAFFOLD.
 *
 * Resolves both the chapter AND its parent, and 404s if either is missing or
 * unpublished — so a published chapter under a draft case file is unreachable,
 * matching the RLS policy rather than diverging from it.
 *
 * Still to come (Phase 1): ObjectiveHeader, DecisionBlock, FeatureStrip,
 * RedactedEvidence, MilestoneClose, NextCaseHandoff.
 */
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

  return (
    <PageShell
      locale={l}
      title={detail.fields.title ?? chapter}
      crumbs={[
        { label: ui.t("home") ?? "", href: "/" },
        { label: ui.t("page_work") ?? "", href: "/work" },
        { label: caseTitle, href: `/work/${caseFile}` },
        { label: detail.fields.title ?? chapter },
      ]}
    />
  );
}
