/**
 * The site's canonical origin.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on production deployments and
 * VERCEL_URL on previews. NEXT_PUBLIC_SITE_URL overrides both, which is what
 * the custom domain will use at cutover.
 *
 * Falls back to localhost so sitemap/robots/llms.txt render in development
 * rather than throwing — an absolute URL is required by all three formats.
 */
/** Warn once per process, not once per call. */
let warned = false;

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;

  /*
   * ⚠️ Nothing configured. In development this is correct and expected. In a
   * PRODUCTION build it means every absolute URL the site emits — sitemap,
   * llms.txt, canonicals, og:url — points at a machine nobody else can reach,
   * and a shared link is dead to the outside world.
   *
   * Warned rather than thrown: a build that fails on a missing optional env
   * var is worse than one that says so loudly. Vercel supplies
   * VERCEL_PROJECT_PRODUCTION_URL automatically, so this fires only when
   * building for production somewhere that does not.
   */
  if (process.env.NODE_ENV === "production" && !warned) {
    warned = true;
    console.warn(
      "\n  ⚠️  NEXT_PUBLIC_SITE_URL is not set and no Vercel URL is present.\n" +
        "     Absolute URLs will be emitted as http://localhost:3000 —\n" +
        "     sitemap.xml, llms.txt, canonicals and og:url will all be wrong.\n",
    );
  }

  return "http://localhost:3000";
}
