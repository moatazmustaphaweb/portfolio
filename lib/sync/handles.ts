/**
 * Parsing rules for the two cover blocks that had nowhere to land until 0017:
 * entry handles ("Three ways in") and sibling case files.
 *
 * Pure and dependency-free, like `classify.ts`, so `npm run test:sync` can
 * exercise every branch against the real strings without touching Notion or
 * Supabase.
 */

/* -------------------------------------------------------------------------
 * Title matching
 * ---------------------------------------------------------------------- */

/**
 * Normalise a title for comparison.
 *
 * Necessary, not cosmetic. UAE's cover names its sibling `[Neobiz Mobile —
 * Egypt]` while the case file's own title is `Neobiz Mobile (Egypt)`. An exact
 * match drops that link silently, which is the failure mode this project keeps
 * hitting: the parser finds nothing, reports nothing, and the dry run looks
 * clean.
 *
 * Only punctuation and spacing are normalised. Words are never altered, so two
 * genuinely different titles cannot collapse into one.
 */
export function normalizeTitle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[[\]()—–\-_,.:;·"'`«»]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

/* -------------------------------------------------------------------------
 * Entry handles — "Three ways in"
 * ---------------------------------------------------------------------- */

export type ParsedHandle = {
  /** The offer, before the arrow. Surrounding quotes stripped. */
  invitation: string;
  /** Everything after the arrow, verbatim. */
  payoff: string;
  /**
   * The trailing sentence naming where to go, when there is one:
   * "Chapter 2." · "Application workflow → Craft."
   * Null when the handle names no destination — which is normal; UAE's three
   * handles name none.
   */
  pointer: string | null;
};

/** Arrow forms seen in the source. `->` included so a plain-text edit works. */
const ARROW = /\s*(?:→|➔|=>|->)\s*/u;

/**
 * The same, plus the RTL arrow `←` (U+2190).
 *
 * Arabic handles are written `<invitation> ← <payoff>`, because in RTL the
 * forward arrow IS `←` — the project's own rtl-guard states this, and the
 * Arabic body copy relies on it. The parser knew only `→`, so **every Arabic
 * entry handle failed to parse**: all twelve were written in Notion, found by
 * the sync, and silently dropped.
 *
 * Kept separate from ARROW rather than added to it, because `←` is NOT a
 * separator in the English copy — it appears there as hierarchy notation, in
 * `Instance ← Organisation ← Team ← Project`. Splitting an English payoff on
 * it would cut a sentence in half at its first hierarchy mark. One arrow set
 * per direction; the caller knows which it is reading.
 */
const ARROW_RTL = /\s*(?:←|⬅|→|➔|=>|->|<-)\s*/u;

/**
 * Parse one handle paragraph.
 *
 * The shape is `<invitation> → <payoff>`, in two registers that both appear in
 * the source and are equally correct:
 *
 *   If you want the hardest architectural problem → …
 *   "Show me the hardest decision." → …
 *
 * Returns null for a paragraph with no arrow — a stray line under the heading
 * is not a handle, and inventing one from it would put words on the cover that
 * were never written as a handle.
 */
export function parseEntryHandle(
  raw: string,
  /** Pass `"ar"` when reading an Arabic page, so `←` counts as the separator. */
  locale: "en" | "ar" = "en",
): ParsedHandle | null {
  const text = raw.trim();
  if (!text) return null;

  const arrow = locale === "ar" ? ARROW_RTL : ARROW;
  const match = arrow.exec(text);
  if (!match || match.index === 0) return null;

  const invitation = stripQuotes(text.slice(0, match.index).trim());
  const payoff = text.slice(match.index + match[0].length).trim();
  if (!invitation || !payoff) return null;

  return { invitation, payoff, pointer: findPointer(payoff) };
}

function stripQuotes(s: string): string {
  return s.replace(/^["'“”«»]+/u, "").replace(/["'“”«»]+$/u, "").trim();
}

/**
 * The destination sentence, if the payoff ends in one.
 *
 * Always the LAST sentence: the payoff is prose that may itself contain an
 * arrow ("Onboarding journey → Decision."), so anchoring on the first arrow
 * would capture argument text instead of a destination.
 */
function findPointer(payoff: string): string | null {
  // Split on sentence ends, keeping the terminator off the pieces.
  const sentences = payoff
    .split(/(?<=[.!?])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
  const last = sentences[sentences.length - 1];
  if (!last) return null;

  if (ARROW.test(last)) return last;
  if (/^chapter\s+\d+\s*[.!?]?$/iu.test(last)) return last;
  return null;
}

/* -------------------------------------------------------------------------
 * Resolving a pointer to a chapter
 * ---------------------------------------------------------------------- */

export type ChapterRef = {
  slug: string;
  title: string;
  /** `chapters.sort_order`; 1-based for real chapters. */
  sortOrder: number;
  /** Only `kind = 'chapter'` is a numbered destination. */
  isChapter: boolean;
};

/**
 * Resolve a handle's pointer to a chapter slug, or null.
 *
 * Deliberately strict, and null is a perfectly good answer. Two forms resolve:
 *
 *   "Chapter 2."                  → the chapter at sort_order 2
 *   "Application workflow → Craft" → the chapter titled "Application Workflow"
 *
 * Everything else returns null. Egypt's "Results table → What broke." names a
 * results table, which is not a chapter and has no page of its own yet;
 * guessing a nearby chapter would manufacture a destination the author never
 * wrote. An unresolved handle renders as text above a living map that lists
 * every chapter, so the reader is never stranded.
 */
export function resolveHandleTarget(
  pointer: string | null,
  chapters: readonly ChapterRef[],
): string | null {
  if (!pointer) return null;

  // "Chapter 2." — positional, and unambiguous given sort_order.
  const positional = /^chapter\s+(\d+)\s*[.!?]?$/iu.exec(pointer.trim());
  if (positional) {
    const n = Number(positional[1]);
    const hit = chapters.find((c) => c.isChapter && c.sortOrder === n);
    return hit?.slug ?? null;
  }

  /*
   * Title form. Only the segment BEFORE the arrow names the chapter; the part
   * after it names a section within that chapter, which has no route of its
   * own. Compare against full titles only — a substring match would let
   * "Onboarding" claim "Mobile Onboarding Journey" in a different case file.
   */
  const head = pointer.split(ARROW)[0];
  if (!head) return null;
  const needle = normalizeTitle(head);
  if (!needle) return null;

  const matches = chapters.filter((c) => normalizeTitle(c.title) === needle);
  // Two chapters with the same title is a content problem, not a coin toss.
  return matches.length === 1 ? matches[0].slug : null;
}

/* -------------------------------------------------------------------------
 * Sibling case files
 * ---------------------------------------------------------------------- */

export type ParsedSiblings = {
  /** Titles exactly as written on the cover, in order. */
  titles: string[];
  /** The trailing explanation, if the line carries one. */
  note: string | null;
};

/**
 * Parse a sibling declaration:
 *
 *   Sibling case file: [Egypt Acquisition (Web)] and [Neobiz Mobile — Egypt]
 *   — the same requirement, in a market without the infrastructure.
 *
 * Requires BOTH the prefix and at least one bracketed title. That is what
 * separates it from the other trailing line on these covers — Egypt's
 * "Cross-cutting: Accessibility — …" — which points at a chapter, not a case
 * file, and must not become a sibling link.
 */
/** The sibling-line opener, in both languages. */
const SIBLING_PREFIX = /^(?:sibling case files?|siblings?|ملف شقيق|ملفات شقيقة)\s*:/iu;

/**
 * Does this line ANNOUNCE itself as a sibling line, whatever else is wrong
 * with it?
 *
 * Deliberately weaker than `parseSiblingLine`, which additionally requires
 * `[Bracketed]` titles and returns null without them. The Arabic sibling line
 * on the UAE cover names its siblings in prose rather than brackets, so it
 * parsed as neither a sibling nor a handle — it simply fell through, and was
 * counted as a handle line that failed. That put UAE at "4 lines, 3 parsed"
 * and made the whole Arabic handle set unpairable.
 *
 * A line opening `ملف شقيق:` is not an entry handle. That is true regardless
 * of whether the rest of it can be parsed, so the exclusion is tested on the
 * prefix alone.
 */
export function looksLikeSiblingLine(raw: string): boolean {
  return SIBLING_PREFIX.test(raw.trim());
}

/**
 * A cross-cutting pointer: a line under the handles heading that points at
 * something spanning the whole case file rather than at one chapter.
 *
 *   Cross-cutting: Accessibility — Bilingual, RTL & Regulatory Comprehension: …
 *   شامل عبر الفصول: قابلية الوصول والاستخدام في منتج مصرفي ثنائي اللغة: …
 *
 * A deliberate authoring convention, not a stray line, so the parser learns it
 * rather than the writing moving to suit the parser. It is not an entry handle:
 * it names no chapter to link and carries no invitation/payoff split.
 *
 * Verified against the Egypt cover in Notion rather than assumed — both
 * spellings appear there verbatim, English and Arabic, each as the fourth line
 * under the handles heading.
 *
 * Excluded by PREFIX for the same reason sibling lines are: a line that
 * announces what it is stops being a handle candidate at that point, whatever
 * else is true of its syntax.
 */
const CROSS_CUTTING_PREFIX = /^(cross-cutting|شامل عبر الفصول)\s*:/iu;

export function looksLikeCrossCuttingLine(raw: string): boolean {
  return CROSS_CUTTING_PREFIX.test(raw.trim());
}

/**
 * Any line that announces itself as something other than an entry handle.
 *
 * One predicate for both loops so English and Arabic cannot drift — the English
 * loop silently skipped its `Cross-cutting:` line for months while the Arabic
 * side reported the identical line as a failure, because only one of the two
 * had a completeness check.
 */
export function isNonHandleLine(raw: string): boolean {
  return looksLikeSiblingLine(raw) || looksLikeCrossCuttingLine(raw);
}

export function parseSiblingLine(raw: string): ParsedSiblings | null {
  const text = raw.trim();
  if (!SIBLING_PREFIX.test(text)) {
    return null;
  }

  const titles = [...text.matchAll(/\[([^\]]+)\]/gu)]
    .map((m) => m[1].trim())
    .filter(Boolean);
  if (titles.length === 0) return null;

  /*
   * The note is whatever follows the final bracket, minus the separator.
   *
   * ⚠️ The separator is NOT always a dash, and assuming it was shipped a
   * defect. The UAE cover writes `…[Neobiz Mobile — Egypt]. Same bank, same
   * regulatory requirement…` — a full stop closing the bracketed list, then
   * the sentence. A dash-only strip left the stop attached, and
   * `/ar/work/uae-acquisition` rendered ". Same bank, same regulatory
   * requirement…" on a published page until 2026-08-23, task `020230826`.
   *
   * Fixed here rather than in Notion. `docs/learn.md` Part 3: Notion is the
   * source, and a parser that cannot read finished prose is the thing that is
   * broken. `]. ` is ordinary punctuation, not an authoring error.
   *
   * `:` is included for the same reason — the cross-cutting line one function
   * below uses it, and a sibling line written that way should not lose to a
   * character class.
   */
  const afterLast = text.slice(text.lastIndexOf("]") + 1);
  const note = afterLast.replace(/^\s*[—–\-.:]\s*/u, "").trim();

  return { titles, note: note || null };
}
