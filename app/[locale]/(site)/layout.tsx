import { SiteFooter } from "@/components/layout/SiteFooter";
import type { Locale } from "@/lib/content/types";

/**
 * Every page except the Landing page.
 *
 * The full footer lives here rather than in the root locale layout, so the
 * Landing page can carry a minimal one WITHOUT any page having to remember to
 * opt out. The distinction is structural: which route group a page sits in
 * decides its footer. A `variant` prop would have worked until someone forgot
 * to pass it.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  /*
   * `flex-1` on <main> is what pins the footer: <body> is a
   * `min-h-screen` flex column, so main absorbs the free space and the footer
   * lands at the bottom of the viewport on short pages and after the content
   * on long ones.
   */
  return (
    <>
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale as Locale} />
    </>
  );
}
