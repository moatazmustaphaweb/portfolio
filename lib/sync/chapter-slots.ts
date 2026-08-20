/**
 * Chapter slots — the one place that defines what a chapter can be made of.
 *
 * The direct counterpart of `cover-slots.ts`, and deliberately the same shape.
 * A chapter is composed of NAMED SLOTS: the slot is structure, the heading text
 * a chapter uses for it is content. Which slots are present, what heading each
 * carries, and what order they appear in are all data.
 *
 * Chapter One (Egypt / Onboarding Journey) is written as:
 *
 *   objective · context · evidence · what-i-designed · the-interface ·
 *   the-fight-i-lost · result
 *
 * Its Arabic page has no `the-interface` section. That is an absence, not an
 * error, exactly as Neobiz having no `role` slot is not an error on a cover.
 *
 * Pure and dependency-free apart from `classify` and `cover-slots`, so
 * `npm run test:sync` can exercise it with no credentials and no network.
 */

import { parseDecisionHeading } from "./classify";
import { normaliseHeading } from "./cover-slots";

/*
 * Re-exported rather than redefined.
 *
 * `chapter_slot_aliases.heading_norm` and `cover_slot_aliases.heading_norm` are
 * seeded by the same rules, and two copies of a normaliser drift the moment one
 * of them learns about a new kind of punctuation. A drift here does not throw —
 * it looks exactly like an unrecognised heading, which is the most expensive
 * kind of bug this file can have.
 */
export { normaliseHeading };

/** Prose slots — carried through and rendered as written. */
export const PROSE_SLOTS = [
  /* Recurring across most chapters. */
  "objective",
  "context",
  "evidence",
  "result",
  "milestone",

  /* Egypt — Onboarding Journey */
  "what-i-designed",
  "the-interface",
  /*
   * Shared with UAE, whose section is headed "The argument I lost in two
   * countries". Different chapters, same structural move — which is exactly
   * what a slot is for. Sharing is safe here because `unique (chapter_id, slot)`
   * only forbids two sections on ONE chapter, and no chapter carries both.
   */
  "the-fight-i-lost",

  /* Egypt — Application Workflow */
  "what-v1-got-wrong",
  "how-problems-were-found",
  "on-preventing-errors",

  /* Egypt — Customer Portal & Notifications */
  "notifications",
  "withdrawal",

  /* Egypt — Fulfilment & AOF */
  "the-physical-layer",
  "the-opening-constraint",

  /* Neobiz — Customer Portal */
  "what-carries-over",

  /* UAE — Mobile Onboarding Journey */
  "tracking-and-exceptions",
  "what-id-change",

  /* Cervello — On-Premises to Cloud */
  "problems-as-presented",

  /* Cervello — Method & Design System */
  "why-this-chapter-exists",
  "principles",
  "ideas-before-screens",
  "design-system-handoff",
  "feature-catalogue",
  "what-this-became",

  /* Comparison pages */
  "the-rule",
  "the-differences",
  "what-this-is-evidence-of",
  "what-never-changes",
  "what-mobile-changes",
  "the-one-line-version",

  /* Accessibility */
  "the-position",
  "why-this-argument-won",
  "what-shipped",
  /*
   * Six NUMBERED sections, each a distinct principle. They must be six slots:
   * they sit on one page, so a shared slot would hit unique (chapter_id, slot)
   * and fail the page for being written as intended.
   */
  "principle-1",
  "principle-2",
  "principle-3",
  "principle-4",
  "principle-5",
  "principle-6",
  "design-system-contribution",
  "conformance",
  "component-library",
  "why-beyond-compliance",
] as const;

/**
 * Structural slots — machine-read by their own parsers.
 *
 * `features` becomes one `features` row per table row or list item. The slot
 * exists here so the section is ACCOUNTED FOR rather than reported as an
 * unrecognised heading.
 */
export const STRUCTURAL_SLOTS = ["features"] as const;

export const ALL_SLOTS = [...PROSE_SLOTS, ...STRUCTURAL_SLOTS] as const;

export type ProseSlot = (typeof PROSE_SLOTS)[number];
export type Slot = (typeof ALL_SLOTS)[number];

export function isProseSlot(slot: string): slot is ProseSlot {
  return (PROSE_SLOTS as readonly string[]).includes(slot);
}

export function isKnownSlot(slot: string): slot is Slot {
  return (ALL_SLOTS as readonly string[]).includes(slot);
}

/**
 * Is this heading a decision, rather than a section?
 *
 * ⚠️ Load-bearing, and the one way this model differs from covers.
 *
 * A chapter carries SEVERAL decision headings — `Decision · The language
 * fight`, `القرار الأول · ...`, `القرار الثاني · ...` — and they are already
 * parsed into the `decisions` table by their own pass. If they also resolved to
 * a slot, the second one would hit `unique (chapter_id, slot)` and fail the
 * whole chapter for being written exactly as intended.
 *
 * They must not be reported as unrecognised headings either: that would be a
 * refusal on every chapter, on every run, for content that syncs correctly —
 * and a guard that cries wolf is a guard that gets switched off.
 */
export function isDecisionHeading(heading: string): boolean {
  return parseDecisionHeading(heading) !== null;
}

export type SlotResolution =
  | { ok: true; slot: Slot }
  | { ok: false; heading: string; normalised: string };

/**
 * Resolve a heading to its slot, or refuse.
 *
 * ⚠️ It never guesses and it never discards — the two failure modes this model
 * exists to end, restated here because chapters had both:
 *
 *  - DISCARDING lost `What I designed`, `The interface` and `The fight I lost`
 *    for the life of the project. `CHAPTER_FIELDS` did `if (!field) continue`,
 *    so a heading outside a six-name list took its whole passage with it —
 *    including nine of Chapter One's sixteen image tags, per locale.
 *  - GUESSING is the trap. `The interface` is not a near-miss of `evidence`;
 *    it is a different section, and a nearest-match would overwrite one with
 *    the other.
 *
 * An unresolved heading returns `ok: false` and the caller fails that chapter
 * with a message naming the heading and the slots. Loud, and never partial.
 */
export function resolveSlot(
  heading: string,
  aliases: ReadonlyMap<string, string>,
): SlotResolution {
  const normalised = normaliseHeading(heading);
  const slot = aliases.get(normalised);
  if (slot && isKnownSlot(slot)) return { ok: true, slot };
  return { ok: false, heading, normalised };
}

/** The message an unrecognised heading produces. Named so the tests assert it. */
export function unknownHeadingMessage(
  chapterTitle: string,
  r: Extract<SlotResolution, { ok: false }>,
): string {
  return (
    `${chapterTitle}: heading ${JSON.stringify(r.heading)} matches no chapter slot. ` +
    `The section was NOT written — nothing is discarded silently.\n` +
    `      normalised to: ${JSON.stringify(r.normalised)}\n` +
    `      known slots: ${ALL_SLOTS.join(" · ")}\n` +
    `      fix: add a row to chapter_slot_aliases mapping this heading to a slot ` +
    `(no code change, no deploy), or correct the heading in Notion.`
  );
}
