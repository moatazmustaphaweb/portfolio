/**
 * Cloudinary transform presets.
 *
 * Rule 3: image URLs are NEVER stored. Only `media.cloudinary_public_id` lives
 * in the database; every URL is built at render from a public_id plus one of
 * the named presets below. A global sizing change is an edit here, not a
 * content migration.
 *
 * These are the only sizes the site serves. If a layout needs something else,
 * add a preset — do not pass ad-hoc dimensions at a call site, or the "named
 * preset" guarantee decays into arbitrary numbers scattered through components.
 */

export type PresetName = "thumb" | "card" | "hero" | "gallery" | "redacted";

export type Preset = {
  /** Intended rendered width in CSS pixels at the largest breakpoint. */
  width: number;
  height?: number;
  /** Cloudinary crop mode. `fill` crops to fit; `limit` never upscales. */
  crop: "fill" | "limit" | "fit";
  /** Focus point for `fill` crops. */
  gravity?: "auto" | "center";
  /** `sizes` attribute — tells the browser which width it will actually use. */
  sizes: string;
};

/*
 * f_auto (format negotiation) and q_auto (quality) are applied to every preset
 * by next-cloudinary and are deliberately not repeated here.
 */
export const PRESETS: Record<PresetName, Preset> = {
  /** Small square-ish preview — nav, inline references, dense lists. */
  thumb: {
    width: 160,
    height: 160,
    crop: "fill",
    gravity: "auto",
    sizes: "160px",
  },

  /** Gallery and project cards. Two-up on tablet, three-up on desktop. */
  card: {
    width: 640,
    height: 400,
    crop: "fill",
    gravity: "auto",
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  },

  /** Case file cover and chapter hero. Full container width. */
  hero: {
    width: 1200,
    crop: "limit",
    sizes: "(max-width: 1200px) 100vw, 1200px",
  },

  /**
   * Evidence images inside a chapter. Constrained to the reading column, and
   * `limit` rather than `fill` so nothing is cropped — an evidence shot that
   * loses its edges loses the evidence.
   */
  gallery: {
    width: 1000,
    crop: "limit",
    sizes: "(max-width: 1000px) 100vw, 1000px",
  },

  /**
   * ⚠️ PLACEHOLDER — open question H.
   *
   * Deliberately identical to `gallery`: no blur, no pixelation, no tint. The
   * NDA treatment is a design decision (decision 002 calls it a crafted
   * signature), and inventing one would both pre-empt that decision and risk
   * looking like a broken asset rather than an intentional one.
   *
   * `RedactedEvidence` currently renders a plain bordered surface with the
   * shared `redacted_notice` badge and its caption. See docs/redaction-brief.md.
   *
   * IMPORTANT once the treatment exists: a live Cloudinary transform does not
   * remove the original — stripping the transform segment from the URL returns
   * the untouched image. The brief recommends baking redaction into the asset
   * before upload so no unredacted original ever reaches Cloudinary. If that
   * recommendation is followed, this preset stays a sizing preset and never
   * becomes the thing protecting NDA material.
   */
  redacted: {
    width: 1000,
    crop: "limit",
    sizes: "(max-width: 1000px) 100vw, 1000px",
  },
};
