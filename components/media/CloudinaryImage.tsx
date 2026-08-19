import { getCldImageUrl } from "next-cloudinary";

import { CLOUDINARY_CLOUD_NAME } from "@/lib/media/cloud";
import { NDA_TRANSFORM, PRESETS, type PresetName } from "@/lib/media/presets";
import type { Media } from "@/lib/content/types";

/**
 * The ONLY component allowed to construct an image URL (rule 3).
 *
 * Everything else passes a `media` row and a preset name. If you find yourself
 * building a Cloudinary URL anywhere else, that is the bug.
 *
 * Implementation note: this uses `getCldImageUrl` (a pure function) with a
 * plain <img>, NOT next-cloudinary's <CldImage>. CldImage is a client component
 * — it calls useState — so it would force `"use client"` up this tree and ship
 * JS for every image on a site that is otherwise entirely server-rendered.
 * next/image was also rejected: it would re-optimise an image Cloudinary has
 * already optimised, paying for the same work twice.
 *
 * Alt text comes from `translations` field `alt`. A missing alt is NOT the same
 * as a decorative image, so the two cases are distinguished:
 *   - `decorative` → alt="" and hidden from assistive tech
 *   - no alt translation, not decorative → the image is OMITTED
 *
 * That second case is deliberate. Shipping an unlabelled image would quietly
 * fail the accessibility baseline; omitting it is visible and gets fixed.
 */
export function CloudinaryImage({
  media,
  preset,
  decorative = false,
  className,
  priority = false,
}: {
  media: Media | null;
  preset: PresetName;
  decorative?: boolean;
  className?: string;
  /** Set on the LCP image only — the case file cover or chapter hero. */
  priority?: boolean;
}) {
  if (!media) return null;

  /*
   * Cloudinary unconfigured -> omit the image, do not throw.
   *
   * `getCldImageUrl` raises without a cloud name, and because this renders on
   * the server that exception took the whole /work gallery down with a 500 the
   * moment the first cover row existed. `docs/status.md` already states the
   * intended behaviour -- "every image is omitted until it exists" -- so this
   * is the code catching up to the documented contract, not a new policy.
   *
   * Unreachable while the default in `lib/media/cloud.ts` stands. It is kept
   * because the thing it guards is a 500 on the site's main page, and the cost
   * of keeping it is one comparison.
   */
  if (!CLOUDINARY_CLOUD_NAME) return null;

  const alt = decorative ? "" : media.fields.alt;
  if (alt === undefined) return null;

  /*
   * A redacted image is FORCED onto the redacted preset, whatever the caller
   * asked for (decision 028). This is the enforcement, not a default: the
   * redacted preset is the only non-cropping one, and an off-centre crop can
   * clip a mask and expose the data beneath it. That failure is silent — the
   * image still looks normal — so it cannot be left to callers passing the
   * right preset. The redacted path is structurally incapable of cropping.
   */
  const effectivePreset: PresetName = media.redacted ? "redacted" : preset;
  const config = PRESETS[effectivePreset];

  /*
   * Preserve the intrinsic aspect ratio for `limit` crops so the browser
   * reserves the right box and the page does not shift as images load. For
   * `fill` crops the preset's own dimensions are authoritative.
   */
  const height =
    config.height ??
    (media.width && media.height
      ? Math.round((config.width * media.height) / media.width)
      : undefined);

  /*
   * The NDA treatment rides on the media row, not on a prop, so no call site
   * can forget it (amendment 036). Applied as a raw transformation so it
   * composes with whatever the preset does.
   */
  const ndaTreatment = media.nda ? { rawTransformations: [NDA_TRANSFORM] } : {};

  const urlFor = (width: number) =>
    getCldImageUrl(
      {
        ...ndaTreatment,
        src: media.cloudinary_public_id,
        width,
        height: config.height
          ? Math.round((width * config.height) / config.width)
          : undefined,
        crop: config.crop,
        gravity: config.gravity,
        // Format and quality negotiation — pure wins, applied to every preset.
        format: "auto",
        quality: "auto",
      },
      /*
       * The cloud name is passed, not left to the library's own
       * `process.env` read: `next-cloudinary` takes `config.cloud.cloudName`
       * first and only falls back to the environment. Passing it makes this
       * call independent of whether the bundler substitutes a NEXT_PUBLIC_
       * reference inside node_modules.
       */
      { cloud: { cloudName: CLOUDINARY_CLOUD_NAME } },
    );

  return (
    /*
     * `CldImage` is a client component and this is a server component. The URL
     * is already built by `getCldImageUrl` from a named preset, so next/image
     * would put a second optimiser in front of Cloudinary's for no gain.
     */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urlFor(config.width)}
      // 2x for high-density displays. Cloudinary caches each derived width, so
      // the second variant costs one build, not one per visitor.
      srcSet={`${urlFor(config.width)} 1x, ${urlFor(config.width * 2)} 2x`}
      sizes={config.sizes}
      alt={alt}
      width={config.width}
      height={height ?? config.width}
      className={className}
      loading={priority ? "eager" : "lazy"}
      // fetchPriority is the part that actually helps LCP; loading="eager"
      // alone only stops it being deferred.
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      aria-hidden={decorative || undefined}
    />
  );
}
