/**
 * The Cloudinary cloud name, with a committed default (decision 052).
 *
 * Public by construction: `vewhrkzj` is the first path segment of every image
 * URL this site serves, readable in the page source of any page carrying an
 * image. Rule 5 governs secrets — things that grant access — and this grants
 * none. It was unset in the Vercel project on 2026-08-19 and took `/work` down
 * with a 500 the moment the first cover row existed.
 *
 * A real environment variable still wins, so setting it in Vercel remains an
 * override rather than a prerequisite.
 *
 * This is a plain module constant rather than a `next.config.mjs` `env` entry
 * on purpose. `next-cloudinary` reads `process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
 * inside its own bundled code, and whether that reference is substituted at
 * build time is a property of the bundler, not of this repo. An imported
 * constant passed explicitly to `getCldImageUrl` depends on nothing.
 */
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "vewhrkzj";
