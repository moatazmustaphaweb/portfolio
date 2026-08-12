import { SiteFooter } from "@/components/layout/SiteFooter";
import type { Locale } from "@/lib/content/types";

/**
 * The Landing page.
 *
 * Supplies <main> and the MINIMAL footer, mirroring `(site)`. The footer is a
 * sibling of <main> rather than inside it, so `flex-1` pins it to the bottom
 * of the viewport on a short page.
 *
 * Which route group a page sits in still decides its footer — the page itself
 * renders neither.
 */
export default async function LandingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter locale={locale as Locale} variant="minimal" />
    </>
  );
}
