import Link from "next/link";

import type { EntryHandle, Locale } from "@/lib/content/types";

/**
 * "Three ways in."
 *
 * The cover's answer to the fact that no two readers arrive for the same
 * reason. A hiring manager wants the hardest decision; an engineer wants the
 * complexity; a design lead wants the method. Each handle names one of those
 * and says where it lives, so nobody has to read a case file front to back to
 * find out whether it contains what they came for.
 *
 * Two states, both correct:
 *
 *  - RESOLVED — the handle names a chapter, and the whole card is a link.
 *  - UNRESOLVED — the handle names no chapter, or names something that is not
 *    a chapter, and it renders as text. UAE's three handles are all like this,
 *    and Egypt's "Results table → What broke" points at a results table that
 *    has no page yet. A link invented for these would go somewhere the author
 *    never pointed; the living map directly below lists every chapter, so the
 *    reader still has a way onward.
 *
 * The invitation is typeset larger than the payoff because it is the part
 * being chosen between — a reader scans the three offers first and only reads
 * the one that matches.
 */
export function EntryHandles({
  handles,
  caseFileSlug,
  locale,
  heading,
}: {
  handles: EntryHandle[];
  caseFileSlug: string;
  locale: Locale;
  /** `ui_strings.entry_handles_heading`. */
  heading?: string;
}) {
  const usable = handles.filter((h) => h.invitation && h.payoff);
  if (usable.length === 0) return null;

  return (
    <section className="mt-14">
      {heading ? <h2 className="mb-5 text-h3 text-fg">{heading}</h2> : null}

      <ul className="flex flex-col gap-px overflow-hidden rounded-panel border border-DEFAULT bg-border">
        {usable.map((handle) => {
          const inner = (
            <>
              <span className="text-statement text-fg">{handle.invitation}</span>
              <span className="max-w-measure text-body-sm text-fg-muted">
                {handle.payoff}
              </span>
            </>
          );

          return (
            <li key={handle.id}>
              {handle.target ? (
                <Link
                  href={`/${locale}/work/${caseFileSlug}/${handle.target.slug}`}
                  className="flex flex-col gap-2 bg-surface p-card-p transition-colors hover:bg-surface-raised"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex flex-col gap-2 bg-surface p-card-p">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
