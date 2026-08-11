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
  /**
   * Cloudinary crop mode.
   *   fill  — crops to the box. NEVER valid for redacted media (decision 028).
   *   limit — fits inside the box, never upscales.
   *   fit   — fits inside the box, may upscale. Neither fit nor limit crops.
   */
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
   * Redacted evidence. SIZING ONLY — this preset never conceals anything.
   *
   * Decision 027: the redaction is baked into the pixels before upload and the
   * unredacted original never reaches Cloudinary. A live transform would not
   * have protected anything — stripping the transform segment from the URL
   * returns the untouched original — so concealment cannot live here.
   *
   * `c_fit` is load-bearing, not a style choice (decision 028). A redacted
   * image must NEVER be cropped: an off-centre crop can clip a mask and expose
   * the data beneath it, and the failure is silent — it just looks like a
   * normal image. `CloudinaryImage` forces this preset whenever
   * `media.redacted` is true, so the redacted path is structurally incapable
   * of cropping rather than merely configured not to.
   *
   * The visual treatment itself is open question H. `RedactedEvidence` renders
   * a plain bordered surface with the shared badge and caption until it lands.
   */
  redacted: {
    width: 1000,
    crop: "fit",
    sizes: "(max-width: 1000px) 100vw, 1000px",
  },
};
