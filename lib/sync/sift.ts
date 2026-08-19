/**
 * Keep-or-drop with the drops counted.
 *
 * ── THE PROBLEM THIS EXISTS FOR ─────────────────────────────────────────────
 *
 * Several places in the sync pair an Arabic list against an English one BY
 * POSITION, guarded by a length-equality check. That guard is necessary and it
 * is not sufficient, which this project established the hard way: the UAE cover
 * had four candidate handle lines, one was silently dropped, the surviving three
 * matched English's three, and the guard passed. Arabic handle 3 would have been
 * published under English handle 2.
 *
 * The drop and the guard measure different things. A parser that returns only
 * what it understood cannot tell a caller whether it understood everything, so
 * a coincidental match reads as success.
 *
 * `sift` makes the drop part of the result instead of a `continue` statement.
 *
 * ── THE DISTINCTION THAT MAKES IT USABLE ────────────────────────────────────
 *
 * Not everything a parser walks past is a dropped item. `decisionsFromBody`
 * iterates every heading in a chapter — `Objective`, `Context`, `Result` — and
 * almost none of them are decisions. Counting those as drops would refuse every
 * chapter on the site.
 *
 * So a classifier returns one of three things, and the middle one is the point:
 *
 *   { keep }  — understood, use it
 *   { drop }  — it ANNOUNCED ITSELF as this kind of thing and could not be used.
 *               This is the dangerous case: something was meant to be here.
 *   "skip"    — never a candidate. Not counted, not reported.
 *
 * The rule for writing a classifier: `drop` when the input looks like a
 * near-miss of what you wanted, `skip` when it was simply something else.
 */

export type SiftOutcome<Out> =
  | { keep: Out }
  | { drop: { what: string; why: string } }
  | "skip";

export type Sifted<Out> = {
  kept: Out[];
  /** Candidates that announced themselves and could not be used. */
  dropped: { what: string; why: string }[];
  /** kept + dropped — what was offered, as opposed to what survived. */
  readonly found: number;
};

export function sift<In, Out>(
  items: Iterable<In>,
  classify: (item: In) => SiftOutcome<Out>,
): Sifted<Out> {
  const kept: Out[] = [];
  const dropped: { what: string; why: string }[] = [];

  for (const item of items) {
    const outcome = classify(item);
    if (outcome === "skip") continue;
    if ("keep" in outcome) kept.push(outcome.keep);
    else dropped.push(outcome.drop);
  }

  return { kept, dropped, found: kept.length + dropped.length };
}

/**
 * The refusal message for a pairing that cannot be trusted.
 *
 * Names WHAT was dropped and WHY, not just how many. "Kept 3 of 4" is a guard
 * that sends someone hunting through Notion; the offending line is the whole
 * answer, and it is the difference between "a separator the parser does not
 * know" (fix the parser) and "a stray paragraph" (fix nothing).
 *
 * Truncated per item, because a dropped item may be a whole paragraph and this
 * goes into a terminal summary.
 */
export function describeDrops(
  label: string,
  sifted: Pick<Sifted<unknown>, "kept" | "dropped" | "found">,
): string {
  const lines = sifted.dropped.map(
    (d, i) => `      dropped ${i + 1}: ${JSON.stringify(d.what.slice(0, 140))} — ${d.why}`,
  );
  return (
    `${label}: ${sifted.found} candidate(s) found, ${sifted.kept.length} usable. ` +
    `Arabic skipped — pairing by position from an incomplete list would attach ` +
    `the wrong text to the wrong row.\n${lines.join("\n")}`
  );
}
