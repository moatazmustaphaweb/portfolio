/**
 * How a chapter's CONSECUTIVE figures render: one under another, or as a grid.
 *
 * Decided by Moataz, task `004221026`: it is AUTHORED, per chapter, as the
 * Notion property `Image layout` on the chapter page — not inferred from the
 * images, their count or their aspect ratios. Stored in `chapters.image_layout`
 * (migration 0063). This file is the one vocabulary both the sync and the
 * content layer read, so the two cannot drift. Mirrors `device-frame.ts`.
 *
 * The default is `stacked`, because that is what an empty `Image layout` means
 * by decision — and how every chapter rendered before the column existed. An
 * unrecognised value is defaulted too, but the sync REPORTS it (see
 * `lib/sync/image-layout.ts`); only the content layer defaults silently, and
 * only for a NULL or a column that is not there yet, which the database's own
 * default and CHECK make unreachable once 0063 is applied.
 */

export const IMAGE_LAYOUTS = ["stacked", "grid"] as const;

export type ImageLayout = (typeof IMAGE_LAYOUTS)[number];

export const DEFAULT_IMAGE_LAYOUT: ImageLayout = "stacked";

export function isImageLayout(value: unknown): value is ImageLayout {
  return typeof value === "string" && (IMAGE_LAYOUTS as readonly string[]).includes(value);
}

/**
 * A stored `chapters.image_layout` → the layout to render.
 *
 * Accepts `unknown` on purpose: before 0063 is applied, `select("*")` simply
 * does not return the column, and the page must still render — stacked, which
 * is what every chapter showed before the column existed.
 */
export function imageLayoutOrDefault(value: unknown): ImageLayout {
  return isImageLayout(value) ? value : DEFAULT_IMAGE_LAYOUT;
}
