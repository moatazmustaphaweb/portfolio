import { setRequestLocale } from "next-intl/server";

import { PageShell } from "@/components/layout/PageShell";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * SCAFFOLD. Structure only — content arrives from Supabase in Phase 1.
 * The title is a ui_string lookup, never a literal (rule 1).
 */
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const ui = await getUiStrings(l);

  return (
    <PageShell
      locale={l}
      title={ui.t("page_contact")}
      crumbs={[{ label: ui.t("home") ?? "", href: "/" }, { label: ui.t("page_contact") ?? "" }]}
    />
  );
}
