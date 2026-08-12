/**
 * The NDA visual treatment: full grayscale.
 *
 * A precautionary signal, NOT concealment. Amendment 036 corrected the
 * premise — the Mashreq screens are design files containing dummy data the
 * designer wrote himself, so there is nothing to conceal and never was. The
 * screen stays completely legible; the desaturation says "this work sits under
 * an NDA" without a caption having to.
 *
 * The contrast IS the explanation: NDA work renders grey, everything else
 * renders in colour, and the gallery makes that legible at a glance.
 *
 * ⚠️ Why not "grayscale with the accent blue preserved *inside* the image":
 * Cloudinary has no selective-hue effect. There is no transform that
 * desaturates every hue except one. The options actually available are full
 * grayscale (`e_grayscale`), uniform partial desaturation (`e_saturation:-70`,
 * which mutes every colour rather than keeping one), or a duotone
 * (`e_grayscale/e_colorize:N,co_rgb:0070f3`, which tints the WHOLE image blue
 * and costs legibility on a UI screenshot).
 *
 * Full grayscale is used, and the accent blue is preserved where a signal
 * belongs — in the frame around the image: the badge and the border. Switching
 * to duotone is a one-line change here if that is preferred.
 */
export const NDA_TRANSFORM = "e_grayscale";

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
   * NDA evidence. SIZING ONLY — the treatment is a colour transform applied
   * on top, not a crop.
   *
   * `c_fit` is retained (amendment 037). The original reason — an off-centre
   * crop clipping a mask and exposing data — no longer applies, because there
   * are no masks and no data. It is kept for a different and still-valid
   * reason: a design screen cropped off-centre loses the composition that is
   * the actual subject of the case study. `CloudinaryImage` forces this preset
   * whenever `media.redacted` is true.
   */
  redacted: {
    width: 1000,
    crop: "fit",
    sizes: "(max-width: 1000px) 100vw, 1000px",
  },
};
