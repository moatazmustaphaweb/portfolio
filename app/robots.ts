import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site";

/**
 * robots.txt
 *
 * AI crawlers are explicitly ALLOWED. That is a deliberate position, not an
 * oversight: the LLM read test is a launch gate, and a recruiter asking Claude
 * or ChatGPT about this site can only get an accurate answer if the crawlers
 * were permitted to read it. Blocking them would protect nothing — the content
 * is public by design — and would forfeit the channel the site is built for.
 *
 * Named individually as well as covered by the wildcard, because being explicit
 * documents the intent to anyone reading the file later.
 *
 * ── EVERY DEPLOYMENT THAT IS NOT PRODUCTION DISALLOWS EVERYTHING ────────────
 *
 * `preview.moatazmustapha.com` is a public Preview deployment reading the same
 * database as production (decision 060). Indexed, it is a full duplicate of
 * the site competing with it in search. So anything other than
 * `VERCEL_ENV === "production"` gets one rule — every user agent, disallow
 * `/` — and no sitemap or host, so nothing points a crawler back in.
 *
 * Unset counts as non-production. Vercel sets the variable on every
 * deployment, so the only place it is missing is a local machine, and a
 * localhost robots.txt that blocks everything costs nothing. The other choice
 * fails open: a production build anywhere the variable is absent would be
 * indexable without anyone deciding it. The AI-crawler position above is a
 * production position; a preview has nothing for them to read that
 * production does not already serve.
 *
 * The production branch below is unchanged and must stay so. The same
 * condition sets `noindex, nofollow` via `NOINDEX` in `components/layout/document.ts`.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Ingest and cache-invalidation endpoints. Nothing to index, and
        // crawling them would generate noise in the event store.
        disallow: ["/api/"],
      },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
