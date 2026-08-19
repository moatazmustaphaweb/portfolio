/**
 * Cover slots — the one place that defines what a cover can be made of.
 *
 * A cover is composed of NAMED SLOTS. The slot is structure; the heading text a
 * cover uses for it is content. Which slots are present, what heading each
 * carries, and what order they appear in are all data, and all three vary per
 * case file deliberately:
 *
 *   Egypt     thesis · role · map · outcomes · entry-handles
 *   UAE       thesis · role · map · outcomes · entry-handles   (different words)
 *   Neobiz    thesis · what-it-is · status · why-it-matters · entry-handles
 *   Cervello  what-it-is · role · status · why-it-matters · entry-handles
 *
 * Neobiz has no `role` slot; its role is stated inside its thesis. Cervello has
 * no `thesis` slot; it opens with a description. Neither is an error.
 *
 * Pure and dependency-free like `classify.ts` and `handles.ts`, so
 * `npm run test:sync` can exercise it with no credentials and no network.
 */

/** Prose slots — carried through and rendered as written. */
export const PROSE_SLOTS = [
  "thesis",
  "what-it-is",
  "role",
  "map",
  "status",
  "why-it-matters",
] as const;

/**
 * Structural slots — machine-read by their own parsers.
 *
 * A table becomes rows with status markers; a list becomes handles pointing at
 * chapters. Those parsers and every guard added to them stay exactly as they
 * are. These slots exist here so the section is ACCOUNTED FOR rather than
 * reported as an unrecognised heading.
 */
export const STRUCTURAL_SLOTS = ["outcomes", "entry-handles"] as const;

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
 * Normalise a heading for alias lookup.
 *
 * Must match how `cover_slot_aliases.heading_norm` was seeded — the seed and
 * this function are the two halves of one agreement, and a drift between them
 * looks exactly like an unrecognised heading.
 *
 * What it removes and why:
 *  - case, so "Thesis" and "thesis" are one row;
 *  - punctuation, so "Status, honestly" and "Status honestly" are one row and
 *    "What's in it" survives a straight-versus-curly apostrophe;
 *  - repeated whitespace, so a stray double space in Notion is not a new alias.
 *
 * What it KEEPS: letters, numbers, and Arabic combining marks. `\p{M}` is
 * deliberate — harakat are marks, not letters, and stripping them turns
 * `ولماذا يهم رغم أنه لم يُبنَ` into a different string. The same trap is
 * documented in headingToSlug for the same reason.
 */
export function normaliseHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[‘’“”'"]/gu, "")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

export type SlotResolution =
  | { ok: true; slot: Slot }
  | { ok: false; heading: string; normalised: string };

/**
 * Resolve a heading to its slot, or refuse.
 *
 * ⚠️ It never guesses and it never discards. Those are the two failure modes
 * this model exists to end:
 *
 *  - DISCARDING is what lost Cervello's opening section for the life of the
 *    project. `COVER_FIELDS` did `if (!field) continue`, so a heading outside a
 *    six-name list took its whole passage with it, silently — and decision 013
 *    makes a missing translation normal, so nothing looked wrong.
 *  - GUESSING is the trap. `what it is` is not a near-miss of `thesis`; it is a
 *    different section. Neobiz carries both, and a nearest-match would have
 *    overwritten one with the other.
 *
 * An unresolved heading returns `ok: false` and the caller fails that cover with
 * a message naming the heading and the slots. Loud, and never partial.
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
  coverTitle: string,
  r: Extract<SlotResolution, { ok: false }>,
): string {
  return (
    `${coverTitle}: heading ${JSON.stringify(r.heading)} matches no cover slot. ` +
    `The section was NOT written — nothing is discarded silently.\n` +
    `      normalised to: ${JSON.stringify(r.normalised)}\n` +
    `      known slots: ${ALL_SLOTS.join(" · ")}\n` +
    `      fix: add a row to cover_slot_aliases mapping this heading to a slot ` +
    `(no code change, no deploy), or correct the heading in Notion.`
  );
}
