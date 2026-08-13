import Link from "next/link";

import { CloudinaryImage } from "@/components/media/CloudinaryImage";
import { resolveCover } from "@/designs/registry";
import type { CaseFile, Locale } from "@/lib/content/types";

/**
 * A gallery card.
 *
 * The outcome line is the point. Hiring research found evaluators scan for
 * impact before anything else, so a card showing only a title spends the few
 * seconds it gets saying nothing. Title, then outcome, then domain — in that
 * order of visual weight.
 *
 * The NDA treatment needs no code here: the thumbnail is desaturated because
 * `media.nda` travels with the row (amendment 036). The card must simply avoid
 * doing anything that would flatten the contrast — no shared filter, no
 * hover-saturate, no overlay tint. A grey card next to a colour one IS the
 * explanation.
 */
export function ProjectCard({
  caseFile,
  locale,
  ndaLabel,
  statusLabel,
}: {
  caseFile: CaseFile;
  locale: Locale;
  /** `ui_strings.nda_label` — the text half of the NDA signal. */
  ndaLabel?: string;
  /** Resolved label for the outcome's status, e.g. "Projected". */
  statusLabel?: string;
}) {
  const title = caseFile.fields.title;
  // A card with no title is unclickable in any meaningful sense.
  if (!title) return null;

  const headline = caseFile.headline;

  return (
    <li>
      <Link
        href={`/${locale}/work/${caseFile.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-panel border border-DEFAULT bg-surface transition-colors hover:border-strong"
      >
        {/*
          Two cover sources, never both — the database says which via
          `cover_kind`, and the CHECK in migration 0026 makes them exclusive.

          A component cover is inline SVG bound to our tokens, so it follows
          the theme with no JavaScript. It replaces the image slot rather than
          sitting beside it: a card shows one cover or none.

          Note it takes no NDA treatment. The grayscale half of amendment 036
          is a Cloudinary transform and this artwork never reaches Cloudinary —
          the badge below is the half that always worked, and it is what
          carries the signal here (decision 050).
        */}
        {caseFile.cover_kind === "component" && caseFile.cover_component ? (
          <div className="border-b border-DEFAULT">
            {resolveCover(caseFile.cover_component, "card")}
          </div>
        ) : caseFile.cover ? (
          <div className="border-b border-DEFAULT">
            <CloudinaryImage
              media={caseFile.cover}
              preset="card"
              className="h-auto w-full"
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-3 p-card-p">
          <h2 className="text-h3 text-fg">{title}</h2>

          {/*
            The outcome, with its status. The status is never dropped: a figure
            shown without its [projected] / [achieved] marker is exactly the
            misrepresentation decision 007 exists to prevent, and a card is the
            most-screenshotted surface on the site.
          */}
          {/*
            The translated label if there is one, otherwise the raw value.
            NOT both: the sync writes the same string into `outcomes.value` and
            into the `label` translation, so rendering both printed the line
            twice with an em dash between.
          */}
          {headline ? (
            <p className="text-body-sm text-fg-body">
              <span className="text-fg">{headline.label ?? headline.value}</span>
              {statusLabel ? (
                <span className="ms-2 font-mono text-micro uppercase text-fg-dim">
                  {statusLabel}
                </span>
              ) : null}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            {/*
              Domain tag. Rendered from the resolved label, never the raw
              enum value — `smart-things` is a database value, not English.
            */}
            {caseFile.fields.domainLabel ? (
              <span className="rounded-pill border border-DEFAULT px-3 py-1 font-mono text-micro uppercase text-fg-dim">
                {caseFile.fields.domainLabel}
              </span>
            ) : null}

            {/*
              The NDA marker. The grayscale alone would signal by colour only,
              which the accessibility baseline forbids and which vanishes on a
              greyscale display. This is the half that always works.
            */}
            {caseFile.nda && ndaLabel ? (
              <span className="rounded-pill border border-nda px-3 py-1 font-mono text-micro uppercase text-fg-dim">
                {ndaLabel}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
