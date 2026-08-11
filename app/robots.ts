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
 */
export default function robots(): MetadataRoute.Robots {
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
