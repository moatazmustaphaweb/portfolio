---
name: metric-integrity
description: Enforces the no-fabricated-metrics rule on every number, outcome, target, result claim, and results table on this site — status markers, the sync parser, status pills, and any animation applied to a figure. Use when writing or reviewing content, outcomes, targets, seed data, or components that render a metric.
---

# Metric Integrity

Every figure on this site is defensible in an interview or it is not published. This is the project's hardest constraint: a published metric that cannot be defended is a stated failure condition in `docs/brief.md`.

References: `docs/sync-contract.md` (Step 5), `docs/schema.md` (enums), `docs/design/tokens.md` (status pills).

## The three states, and only these

```sql
outcome_status  = ('projected', 'achieved', 'not-measurable')
target_status   = ('achieved', 'missed', 'not-measurable')
```

Both columns are declared **with no default**. Every row is an explicit call. A marker outside these sets — `[reported]`, `[estimated]`, `[verified]` — is invalid and stops the work.

Selection:

- `[achieved]` — it happened and there is evidence, including prototype or test evidence, provided the note says so.
- `[projected]` — a forward-looking figure in an outcome or deliverable table. Valid only there.
- `[not-measurable]` — a target exists but has not been measured against a commercial launch. Correct in results tables; a blank is never correct.
- `[missed]` — targets only. A declared target that did not land is closed honestly, not deleted.

## A baseline is not an outcome

The "before" figure a programme was set against — *two weeks to one month under the paper model* — carries no marker, because none of the three fits: it was not achieved, it is not projected, and it is measurable. It belongs in the chapter's `Context` prose, attributed. In a results table it reads as a claim about the work; in context it is what makes the other numbers mean anything.

## The note records how it is known

The marker records **whether** it happened. The note records **how it is known**. A figure marked `[achieved]` on prototype evidence is defensible only when the note says prototype.

The note carries basis, not provenance. Where or how a number was learned — an announcement, a meeting, an internal celebration — stays out of visible copy. Caveats that change how the figure should be read stay in: *"the figure covers web and mobile together, so no single number is attributed to mobile alone."*

## The parser never guesses

`scripts/sync-notion.ts` reads the marker from the first column of the outcomes/targets table and the note from the second. A missing marker **aborts that row and reports it**. No defaults, no inference, no partial write. The rest of the sync continues.

This is the mechanism by which the no-fabrication rule survives automation. Never add a fallback to it.

## Rendering

- Status pills take `min-w-pill` so `محقَّق` / `غير محقَّق` / `غير قابل للقياس` read as one shape down a column.
- Status is never colour alone — every pill carries its label.
- Every declared target appears in the Results Table, closed. A target that is quietly absent is the failure this system exists to prevent.

## Motion applied to a figure

**Count-up animation and condense-in are permitted on `[achieved]` figures only.** `[projected]` and `[not-measurable]` values arrive static.

A number that animates upward reads as measured, live, real. Animating a projection makes a visual claim the copy explicitly refuses to make — the integrity system defeated by a transition. The component reads `outcome_status` and obeys it.

## When a number has no home

Stop and ask. Do not invent a figure, do not soften an absent one into a vague phrase, and do not label something to make a table look complete. Cervello states its limits in prose — *"I have no numbers I can show you"* — and that is a valid, publishable answer.
