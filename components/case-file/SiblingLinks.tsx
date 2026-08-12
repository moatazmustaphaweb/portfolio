import Link from "next/link";

import type { Locale, SiblingLink } from "@/lib/content/types";

/**
 * Sibling case files — the same requirement, in a different market.
 *
 * UAE points at both Egypt files: one requirement, one written by a bank with
 * government identity infrastructure behind it and one written without. Read
 * apart they are two onboarding projects; read together they are the argument
 * that the constraint, not the designer, produced the difference.
 *
 * The note is the pointing cover's own words about why the pair matters, so it
 * renders with the link rather than as a generic "see also".
 *
 * Deliberately near the bottom of the cover: it sends the reader to a
 * different case file, and it should not compete with the chapters of this one.
 */
export function SiblingLinks({
  siblings,
  locale,
  heading,
}: {
  siblings: SiblingLink[];
  locale: Locale;
  /** `ui_strings.sibling_case_files`. */
  heading?: string;
}) {
  const usable = siblings.filter((s) => s.title);
  if (usable.length === 0) return null;

  /*
   * The note is written once per declaration and repeats across the siblings
   * it introduced. Showing it under each link would print the same sentence
   * twice, so it appears once when they all share it.
   */
  const notes = [...new Set(usable.map((s) => s.note).filter(Boolean))];
  const sharedNote = notes.length === 1 ? notes[0] : null;

  return (
    <section className="mt-14 border-t border-DEFAULT pt-8">
      {heading ? (
        <h2 className="font-mono text-micro uppercase text-fg-dim">{heading}</h2>
      ) : null}

      <ul className="mt-4 flex flex-wrap gap-3">
        {usable.map((sibling) => (
          <li key={sibling.id}>
            <Link
              href={`/${locale}/work/${sibling.slug}`}
              className="inline-flex h-control-h items-center rounded-control border border-DEFAULT px-4 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
            >
              {sibling.title}
            </Link>
          </li>
        ))}
      </ul>

      {sharedNote ? (
        <p className="mt-4 max-w-measure text-body-sm text-fg-muted">{sharedNote}</p>
      ) : null}

      {!sharedNote
        ? usable
            .filter((s) => s.note)
            .map((s) => (
              <p
                key={`${s.id}-note`}
                className="mt-3 max-w-measure text-body-sm text-fg-muted"
              >
                {s.title} — {s.note}
              </p>
            ))
        : null}
    </section>
  );
}
