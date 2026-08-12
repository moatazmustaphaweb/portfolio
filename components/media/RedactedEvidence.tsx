import type { Media } from "@/lib/content/types";

import { CloudinaryImage } from "./CloudinaryImage";

/**
 * An evidence image, under NDA or not.
 *
 * The desaturation itself happens in `CloudinaryImage`, driven by
 * `media.nda` (amendment 036). This component supplies the FRAME: the border
 * and the badge that make a grey image read as a deliberate treatment rather
 * than a broken export.
 *
 * The badge is not optional, for two reasons. Decision 002 requires the
 * treatment to read as intentional. And the accessibility baseline forbids
 * signalling anything by colour alone — a desaturated image is *only* a colour
 * difference, so without a text label the signal does not exist for a
 * greyscale display or a screen reader.
 */
export function RedactedEvidence({
  media,
  badge,
  priority = false,
}: {
  media: Media | null;
  /** `ui_strings.redacted_notice`. Shared across every redacted image. */
  badge?: string;
  priority?: boolean;
}) {
  if (!media) return null;

  const caption = media.fields.caption;
  // The badge follows the case file's NDA status, not the per-image flag:
  // every image in an NDA case file is desaturated, so every one needs saying.
  const isNda = media.nda;

  return (
    <figure className="flex flex-col gap-3">
      <div
        className={[
          "overflow-hidden rounded-panel border",
          isNda ? "border-nda bg-nda" : "border-DEFAULT bg-surface",
        ].join(" ")}
      >
        <CloudinaryImage
          media={media}
          preset={media.redacted ? "redacted" : "gallery"}
          priority={priority}
          className="h-auto w-full"
        />
      </div>

      {(isNda && badge) || caption ? (
        <figcaption className="flex flex-wrap items-center gap-3">
          {isNda && badge ? (
            <span className="rounded-pill border border-strong px-3 py-1 font-mono text-micro uppercase text-fg-dim">
              {badge}
            </span>
          ) : null}
          {caption ? (
            <span className="text-meta text-fg-muted">{caption}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
