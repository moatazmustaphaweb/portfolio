import type { Media } from "@/lib/content/types";

import { CloudinaryImage } from "./CloudinaryImage";

/**
 * An evidence image, redacted or not.
 *
 * ⚠️ The redaction TREATMENT is undecided (open question H). This renders a
 * plain bordered surface with the shared badge and caption — deliberately
 * unstyled beyond the existing tokens, so nothing speculative gets baked in
 * ahead of the design. See docs/redaction-brief.md.
 *
 * Decision 002 requires the treatment to read as intentional rather than as a
 * broken or censored asset. The badge is what carries that meaning right now,
 * which is why it is not optional: an image that is visibly obscured with no
 * explanation is exactly the failure mode 002 warns about.
 *
 * The badge also satisfies the accessibility constraint that redaction must not
 * be signalled by colour alone — it is a text label, so it survives greyscale
 * and screen readers.
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
  const isRedacted = media.redacted;

  return (
    <figure className="flex flex-col gap-3">
      <div
        className={[
          "overflow-hidden rounded-panel border",
          isRedacted ? "border-strong bg-redacted" : "border-DEFAULT bg-surface",
        ].join(" ")}
      >
        <CloudinaryImage
          media={media}
          preset={isRedacted ? "redacted" : "gallery"}
          priority={priority}
          className="h-auto w-full"
        />
      </div>

      {(isRedacted && badge) || caption ? (
        <figcaption className="flex flex-wrap items-center gap-3">
          {isRedacted && badge ? (
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
