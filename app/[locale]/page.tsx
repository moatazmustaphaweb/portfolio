import { setRequestLocale } from "next-intl/server";

/**
 * Foundation placeholder.
 *
 * Still carries no copy of its own: the Landing page is Phase 1, and its
 * content will come from Supabase like everything else. The shell around it
 * (header, footer, nav, language switch) is already rendering entirely from the
 * database, which is what task 0.7 set out to prove.
 */
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <div className="mx-auto max-w-container px-gutter py-section-y" />;
}
