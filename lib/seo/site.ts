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
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;

  return "http://localhost:3000";
}
