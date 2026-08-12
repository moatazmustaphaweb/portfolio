/**
 * ISR revalidation window for content routes (decision 009).
 *
 * Every content route exports `revalidate = 300` as a LITERAL. Next requires
 * segment config to be statically analysable and rejects an imported constant
 * with "Invalid segment configuration export", so this file documents the
 * value rather than supplying it. Without it a
 * route built with `generateStaticParams` is baked at build time and never
 * regenerates — which is why a Supabase change appeared to require killing the
 * server and rebuilding, in a private window too, because it was the build
 * output that was stale rather than any browser.
 *
 * Five minutes is the ceiling on how long a change can take to appear on its
 * own. Publishing calls `/api/revalidate`, which makes it immediate; this is
 * the backstop for anything edited directly in Supabase.
 *
 * For content review, use `npm run dev`. Every request re-renders, so a change
 * shows on refresh with no window at all.
 */
export const CONTENT_REVALIDATE = 300;
