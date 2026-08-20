/**
 * Split a long heading at its first internal punctuation mark.
 *
 * A chapter's h1 is its OBJECTIVE, and an objective is a full sentence. At
 * `--text-title` the longest of them fills 60% of a 390px screen before the
 * page has said anything else. This splits the sentence in two so the opening
 * clause keeps the title size and the rest of it can be set one step down —
 * one heading, two sizes, not a title and a subtitle.
 *
 * ── WHAT COUNTS AS A MARK ───────────────────────────────────────────────────
 *
 *   ,  ;  :        Latin comma, semicolon, colon
 *   ،  ؛           Arabic comma (U+060C) and semicolon (U+061B)
 *   —  –           em dash, en dash
 *   ` - `          a hyphen-minus with a space on BOTH sides — a dash typed
 *                  on a keyboard that has no dash key
 *
 * The mark stays with the first part. The tail is what follows it, trimmed.
 *
 * ── WHAT DOES NOT COUNT, AND WHY IT MATTERS ─────────────────────────────────
 *
 * **A hyphen inside a word.** `machine-readable` and
 * `twenty-four-hours-to-three-days` both appear in these objectives, and a bare
 * `-` in the mark set would cut the Egypt onboarding objective at `machine-`.
 * That is why the spaced form above is matched by lookaround rather than by
 * the character alone.
 *
 * **The full stop, `؟` and `!`.** They end a sentence rather than divide one,
 * so a heading built of two short sentences is not a candidate for this
 * treatment — it is already two sentences and reads as such.
 *
 * **Brackets and quotes.** They enclose; they do not divide.
 *
 * ── NO MARK MEANS NO CHANGE ─────────────────────────────────────────────────
 *
 * `tail` is null when there is no mark, when the mark is the last character,
 * or when nothing but whitespace follows it. The caller renders the heading
 * exactly as it renders one today: one string, one size, no extra element.
 */
const MARK = /[,;:،؛]|[—–]|(?<= )-(?= )/u;

export type SplitHeading = {
  /** Everything up to and including the first mark. Never empty. */
  head: string;
  /** Everything after it, or null when the heading is not split. */
  tail: string | null;
};

export function splitHeading(text: string): SplitHeading {
  const at = text.search(MARK);
  if (at === -1) return { head: text, tail: null };

  const head = text.slice(0, at + 1);
  const tail = text.slice(at + 1).trim();
  if (tail.length === 0) return { head: text, tail: null };

  return { head, tail };
}
