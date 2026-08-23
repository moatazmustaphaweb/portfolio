import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/*
 * ⚠️ WRITTEN BY frontend, AND THIS FILE IS devops'. Task 005230826. It is
 * flagged in `docs/status/frontend.md` and in the report; keep or revert is
 * devops' call. It is here because there is no way to do the job from inside
 * frontend's own paths, and the alternative was measurably worse.
 *
 * ── WHAT IT IS FOR ─────────────────────────────────────────────────────────
 *
 * The local preview of unbuilt pages (`components/preview/preview-stubs.ts`)
 * needs routes that exist ONLY when `NEXT_PUBLIC_PREVIEW_STUBS` is set in
 * `.env.local`. A route file cannot make itself conditional: once
 * `page.tsx` is on disk, the route exists, and the best it can do is 404 from
 * inside itself.
 *
 * ── WHY "IT STILL 404s" WAS NOT GOOD ENOUGH ────────────────────────────────
 *
 * Measured against two clean production builds. The preview's routes come from
 * one catch-all, `app/[locale]/(site)/[...preview]`. With that catch-all
 * present and the flag OFF, it still answered 404 — but every unmatched URL on
 * the site now missed a PARAM instead of missing a ROUTE, and Next renders a
 * param miss inside the error shell:
 *
 *     pristine   /en/nonexistent-xyz → <html lang="en" dir="ltr" class="…fonts…">
 *     catch-all  /en/nonexistent-xyz → <html id="__next_error__">
 *
 * No `lang`, no `dir`, no font variables — on EVERY 404 on the site, in both
 * locales, in production. +7.2KB each. That is the leak the brief forbade.
 *
 * ── WHAT THIS DOES ─────────────────────────────────────────────────────────
 *
 * The stub route is named `page.preview.tsx`, which Next does not recognise as
 * a page unless `preview.tsx` is in `pageExtensions`. With the flag off the
 * route does not exist at all — not a 404, not a match, nothing — so the route
 * tree is the pristine one.
 *
 * Verified: two clean `next build` + `next start` runs, pristine against this,
 * 17 URLs including five 404 flavours. Identical byte counts on every one and
 * DOM-identical on every one. The only residue is Turbopack module ids inside
 * the RSC payload, which shift because `work/[caseFile]/page.tsx` imports the
 * stub component for the draft case files.
 *
 * The non-preview list is Next's default. Nothing else about resolution
 * changes.
 */
const PREVIEW_STUBS =
  process.env.NEXT_PUBLIC_PREVIEW_STUBS === "1" ||
  process.env.NEXT_PUBLIC_PREVIEW_STUBS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: PREVIEW_STUBS
    ? ["tsx", "ts", "jsx", "js", "preview.tsx"]
    : ["tsx", "ts", "jsx", "js"],
  // Pin the workspace root — a stray package-lock.json in the home dir would
  // otherwise make Next infer the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  /*
   * Dev only. Next builds an allowlist of hosts permitted to request dev
   * resources (`/_next/hmr`, client chunks) from the host it was started on —
   * `localhost`. A browser pointed at http://127.0.0.1:3000 is a DIFFERENT
   * origin by that rule, so those requests are refused.
   *
   * What that looks like is the reason this is here. The page renders
   * perfectly, because the HTML is server-rendered and unaffected. The client
   * runtime never starts, so every interactive component is inert — a button
   * you can see, focus and click, that does nothing. There is NO error in the
   * browser console; there is not even React's own DevTools notice. The only
   * signal is a warning in the dev server's terminal.
   *
   * This has now cost three sessions and produced one bug report against a
   * feature that was working. "Use localhost" is a correct instruction and a
   * bad control: it has to be remembered every time, by everyone, forever, and
   * failing to is silent. Making the loopback address work is one line.
   *
   * This has no effect on production. It widens nothing beyond two spellings of
   * this machine talking to itself.
   */
  allowedDevOrigins: ["127.0.0.1"],
};

export default withNextIntl(nextConfig);
