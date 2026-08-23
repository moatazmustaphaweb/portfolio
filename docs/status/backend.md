# docs/status/backend.md — backend agent log

**Living document. Newest first.** Written by the `backend` agent as part of the task, never
offered afterwards. An unchanged status file is indistinguishable from work that never ran.

Every entry carries the nine-digit task id the orchestrator assigned — `NNNDDMMYY`, e.g.
`014210826` is task 014 on 21/08/26. That id ties this entry to `docs/status.md` and to
the other agents' entries for the same work. **Entries are dated to match the commit time,
never ahead of it.**

A task that ends in a diagnosis, a refusal, or a question returned still gets an entry.
Two lines, not silence.

The shape of an entry is in `.claude/agents/backend.md`. The structure is in `docs/agents.md`;
the handoffs are in `docs/workflows.md`.

---

## 004230826 — 2026-08-23 12:43 — a chapter paragraph belongs to one locale: 75 Arabic paragraphs recovered

**Brief:** make each locale's paragraph sequence independent within a chapter section.
A paragraph is not a translatable unit; a section is. Keep decision 013's fallback, keep
the pairing gate wherever things still pair, land the 75 held-back Arabic paragraphs,
update `docs/schema.md` and `docs/sync-contract.md` in the same task. Shape mine to choose
and justify.

**Files:** `supabase/migrations/0045_chapter_paragraphs_per_locale.sql` (**new, and
APPLIED to Supabase — live, and its SQL is uncommitted**) · `scripts/sync-notion.ts` ·
`lib/content/chapters.ts` · `lib/supabase/database.types.ts` · `docs/schema.md` ·
`docs/sync-contract.md` · `docs/learn.md` · this entry. **Nothing committed — devops owns
git.** No temporary files left in the repo; the three scratch scripts live under
`$CLAUDE_JOB_DIR/tmp`.

### THE SHAPE, AND WHY THIS ONE

`chapter_paragraphs` gains **`locale`** and **`part`**. A paragraph row belongs to one
language; a section owns two independent sequences; `unique (chapter_section_id, locale,
sort_order)`. Text stays in `translations` — an `en` row carries only an `en` row — which
is what keeps `resolveManyDetailed` able to report the language that actually supplied a
string, and therefore keeps decision 053's `lang` marking working with no new code.

**Nothing is paired, so nothing is gated.** The gate was not loosened; there is no longer
an index to pair on. It is untouched and still refuses on entry handles, outcomes,
targets, decisions, cover sections, `cover_paragraphs` and `page_sections`.

**Tables followed their paragraph.** Each locale's table is its own row with its own
cells, so the grid-shape check went the same way as the prose pairing. Cells 88 → 176,
88 en / 88 ar, four tables each with an `en` and an `ar` copy of identical shape.

**`part` is why the divider split from `003230826` survives.** It is now the unit decision
013 falls back over. Without it, eight Arabic `Result` sections would lose the English
cross-chapter pointer they render today — a change to what a reader sees, and not mine to
make. **Fallback is now per `(section, part)`**, which is stricter than what it replaced:
a section can no longer render half Arabic and half English.

### MEASURED, FROM THE DATABASE

| | before | after |
|---|---|---|
| `chapter_paragraphs` rows | 266 | 522 (266 en · 256 ar) |
| Arabic `body` translations | **177** | **252** |
| English `body` translations | 262 | **262** — unchanged |
| `chapter_table_cells` | 88 | 176 (88 en · 88 ar) |
| `media` | 83 | **91** |
| translations orphaned by the migration | — | **0** |
| rows whose translation locale ≠ row locale | — | **0** |
| `prose` rows with no translation at all | — | **0** |

**+75 Arabic paragraphs. That is the brief's number exactly.** +8 `media` rows are the
Arabic screenshots that were being discarded along with the paragraphs that referenced
them.

**Every slot that was refused now carries its Arabic**, and every count equals the
`↔ar N¶` the dry run predicted — found equals kept:

| chapter | slot | en ¶ | ar before | ar after |
|---|---|---|---|---|
| egypt-acquisition/fulfilment | context | 15 | 0 | **16** |
| egypt-acquisition/workflow | context | 11 | 0 | **13** |
| egypt-acquisition/workflow | what-v1-got-wrong | 10 | 0 | **7** |
| egypt-acquisition/workflow | how-problems-were-found | 6 | 0 | **7** |
| egypt-acquisition/onboarding | what-i-designed | 14 | 0 | **13** |
| egypt-acquisition/web-vs-mobile-onboarding | the-rule | 2 | 0 | **4** |
| egypt-acquisition/web-vs-mobile-onboarding | what-this-is-evidence-of | 3 | 0 | **4** |
| neobiz-mobile/portal | context | 2 | 0 | **5** |
| neobiz-mobile/portal | what-carries-over | 2 | 0 | **3** |
| neobiz-mobile/onboarding | context | 2 | 0 | **3** |
| egypt-acquisition/onboarding | the-interface | 5 | 0 | **0** — no Arabic section exists |
| egypt-acquisition/workflow | the-interface | 5 | 0 | **0** — same |

**The only two slots still at zero Arabic are the two `the-interface` sections**, and
those are genuinely unwritten: they are the only two `chapter_sections` rows in the
database with no Arabic heading either. Not a drop.

The 8 English `result` tails still have no Arabic and are each reported by name on every
run. They fall back to English on the Arabic page, exactly as before.

**Migration backfill, verified separately before the sync ran:** 262 en and 177 ar body
translations preserved, 0 orphans, 0 mismatches. The re-sync then rebuilt everything from
Notion, so the backfill was the safety net it was written to be rather than the delivery.

### VERIFIED BY RUNNING

`npm run sync:notion -- --dry-run` before and after the code change — **shape lines
byte-identical**, notices identical at 7, which is the regression check that the decision
path did not move · `npm run sync:notion` (applied): created 0 · updated 26 · skipped 8 ·
notices 17 · failed 1 · `npx tsc --noEmit` 0 · `npm run lint` 0 · `npm run test:sync` all
pass · `npm run verify:content` all pass, including the six decision-013 fallback checks ·
`npm run check:seed-drift` no drift, 91/91 · `npm run build` exit 0, 65/65 static pages.

**Notices went 7 → 17 and none of the ten new ones is a refusal.** Eight are the tail-gap
report. One is `writeCoverSections` refusing the UAE cover's `thesis` (2 en, 3 ar) — the
identical defect in a second table, see the open items. One is the pre-existing
`egypt-acquisition/workflow` decisions mismatch (1 en, 3 ar), untouched. The single
failure is the pre-existing accessibility-page image tag, unchanged, and it refuses that
page's sections before any delete, so nothing was lost.

### VERIFIED BY LOOKING — `localhost:3000`, dev server, both locales

- **`/ar/work/neobiz-mobile/portal`** — `السياق` now renders **5 Arabic paragraphs**
  where the English page renders 2. `النتيجة` renders 2 Arabic paragraphs then the English
  pointer, `lang="en"`, reading LTR with its full stop on the correct side. Full-page
  screenshot taken at 1200px.
- **`/en/work/neobiz-mobile/portal`** — 2 context paragraphs, all English. Unchanged.
- **`/ar/work/egypt-acquisition/workflow`** — 6 Arabic paragraphs + 7 Arabic captions in
  `context` (13, matching the database), and `the-interface` falls back as a **whole
  section** of English, marked, which is the improvement over the old half-and-half.
  Clipped screenshot of that section.
- **Figures resolve per locale.** `/ar/…/onboarding` serves 16 distinct public IDs, 12 of
  them under `…/Arabic/…`; `/en/…/onboarding` serves 16, 12 under `…/English/…`; they
  share 4. That is Step 6's rule holding structurally now rather than by coincidence of
  matching counts.
- **Both comparison tables render fully in their own language**, 13 rows Arabic and 13
  English on `web-vs-mobile-onboarding`.
- **Route sweep, 52 route-locale combinations, both locales: 50 × 200.** The two
  non-200s are `/{en,ar}/work/uae-acquisition/results`, which 404 because UAE has no
  targets table — pre-existing and unrelated.

### NOT VERIFIED

- **Only three pages were opened in a browser.** The other nine chapters are confirmed
  from the database, the sync log and an HTTP status sweep, not by looking.
- **No production build was exercised beyond `next build`.** Nothing deployed, no ISR,
  no `/api/revalidate`.
- **No accessibility or visual audit**, no keyboard pass, no mobile width.
- **The Arabic that landed was not read for correctness.** 75 paragraphs are now on the
  site that were not there this morning. They are Moataz's own words from Notion and the
  sync did not alter them, but nobody has read the Arabic pages end to end since.
- **`cover_paragraphs` was measured, not touched.**

### FOUND, NOT FIXED — reported per the standing rule

1. **`cover_paragraphs` has the identical defect.** Covers still share one paragraph row
   per position, so the UAE cover's `thesis` — 2 English paragraphs, 3 Arabic — is refused
   on every sync. Measured: 41 rows, 41 en, **39 ar**. It is the same migration in a second
   table and was deliberately left out of this task's scope rather than overlooked. Doing
   it unasked would have widened a migration the orchestrator had not reviewed. **My
   recommendation is that it becomes its own task, soon** — a rule applied in one shape and
   abandoned in another is the exact failure `learn.md` Part 3 already records against this
   lineage.
2. **Every chapter table is missing its real header row, in both languages, and has been
   all along.** `readTable` drops the Notion header row — correct for the outcomes and
   targets tables, where the header is not an item — and the chapter-table writer then
   marks row 0, which is the first *data* row, as `is_header`. So the comparison table's
   first decision renders as its column headings. Pre-existing, unchanged by this task,
   identical before and after. **Two rules colliding, and fixing it changes what a reader
   sees on two published pages**, so it is reported rather than repaired.
3. **A section that exists only in Arabic is still written nowhere.** A chapter's slots
   come from the English page. It was silent; it now raises a notice naming the slot and
   the heading. **Measured across all seventeen chapter pages: zero instances.** The
   notice is a guard against a future one, not a fix for a present one.

**Open questions — returned to the orchestrator, unanswered.** Both are carried forward
from `003230826` and neither blocks anything:

1. **Should the cross-chapter pointer stay in `result` at all?** Every chapter already
   renders a data-driven `Next chapter` / `الفصل التالي` block directly beneath it, in
   both languages. The prose pointer duplicates it, in English, on the Arabic page. This
   task deliberately preserved it — `part` exists partly for that — because removing it
   deletes a line from eight published English pages and that is editorial.
2. If it stays, should it render as a coda rather than as body prose? It is now
   distinguishable in the data (`part = 'tail'`), so this became a frontend question
   rather than a schema one.

---

## 003230826 — 2026-08-23 03:51 — 24 Arabic paragraphs recovered: a chapter section now splits at its closing divider

**Brief:** three reported bugs in the sync. (A) an English-only pointer line after the final
`---` makes every `result` slot off by one and discards the Arabic; (B) `[cld]` tags under a
`Decision ·` heading land in the preceding slot and inflate its count; (C) the `page_section`
path writes no `media` rows. Confirm each before changing anything. Do not touch the
paragraph-count gate. Report measured before/after per chapter, from the database.

**Files:** `scripts/sync-notion.ts` · `docs/sync-contract.md` · `docs/learn.md` · this entry.
**No migration.** No schema change. **Nothing committed — devops owns git.** Three temporary
probe scripts were written under `scripts/` and deleted; `git status` should show only the
three files above.

### (A) CONFIRMED AND FIXED

`readOrderedBlocks` discarded `divider` blocks, so the parser could not see that the pointer
sits *after* the section's closing rule. It now records them, and a chapter section splits at
its **last** divider into `body` and `tail`. The two are counted as separate pairing groups.
**The gate is untouched** — what changed is what it counts.

The test is position, not italics. An all-italic paragraph is ordinary content here: four
sections end with one *before* their divider, and `the-fight-i-lost` is 5¶/5¶ and pairs on it.
Dumped all 17 chapter pages in both locales: exactly **8 blocks** have anything after their
closing divider and all 8 are the pointers. Zero false positives.

Nothing is dropped either way — the tail is still written, same slot, same `sort_order`. The
split decides only what is counted against what, so a misread costs one paragraph's Arabic and
does not remove it from the page.

**Measured, `result` slot, Arabic paragraph translations, before → after:**

| chapter | en | ar before | ar after |
|---|---|---|---|
| cervello/on-premises-to-cloud | 4 | 0 | **3** |
| cervello/permission-architecture | 4 | 0 | **3** |
| egypt-acquisition/fulfilment | 4 | 0 | **3** |
| egypt-acquisition/onboarding | 5 | 0 | **4** |
| egypt-acquisition/portal | 5 | 0 | **4** |
| egypt-acquisition/workflow | 4 | 0 | **3** |
| neobiz-mobile/onboarding | 3 | 0 | **2** |
| neobiz-mobile/portal | 3 | 0 | **2** |
| uae-acquisition/onboarding (control) | 4 | 4 | 4 |

**+24 rows — 20 Arabic prose paragraphs and 4 Arabic image references.** Total
`chapter_paragraph` Arabic bodies **153 → 177**. `media` **80 → 83**. The remaining `en − ar`
of 1 per chapter is the pointer, which has no Arabic; each is reported by name on every run.
Every other slot in the full per-slot table is byte-identical before and after — no regression.

### (B) CONFIRMED REAL, AND IT IS NOT THE CAUSE — NOT CHANGED

Decision-heading images do attach to the preceding section (`resolveChapterSections`, the
`isDecisionHeading` branch), and it is deliberate and documented there. But the brief's
inference does not hold: it inflates **both** locales, not just English, so it is not why
those two chapters fail. Traced item by item:

- `workflow/context` — EN 5¶ + 6 borrowed = 11. AR 7¶ + 6 borrowed = 13. Remove the borrowing
  entirely and it is **5 vs 7**: still refused.
- `fulfilment/context` — EN 5¶ + 10 = 15. AR 6¶ + 10 = 16. Without borrowing, **5 vs 6**.
- `onboarding/context` (8+2 vs 8+2) and `portal/context` (4+7 vs 4+7) pair today and would
  still pair if the groups were separated.

So separating them recovers **zero** Arabic. The real cause on both chapters is that the
Arabic prose genuinely splits differently — and on `workflow`, one English decision is three
in Arabic. That is the bucket the brief reserved for Moataz. **Left alone.**

It is still a latent instance of the index-pairing class. Naming it, not fixing it.

### (C) CONFIRMED — STEP 6 IS NOT IMPLEMENTED ON THAT PATH AT ALL. DIAGNOSIS ONLY

Not a bug in the write: `readOrderedBlocks` puts tags in `items`, and `parsePageSections`
reads only `heading` / `lines` / `tables`. **It never looks at `items`.** And `page_sections`
has one `body` text column per section — no paragraph list, so there is nowhere a
`[image:<uuid>]` could sit.

Measured on the accessibility page: **18 usable tags EN, 18 AR** (17 usable, 1 malformed).
Of **19 distinct public IDs, 14 have no `media` row**; the 5 that do got them from chapter
pages referencing the same screens.

**The fix is not to teach `page_sections` about media** — it is to finish the slot-model
migration, which implements Step 6 already. Blocked by exactly one Notion paragraph, named
by the sync on every run: the Arabic tag
`…/Arabic/Post-Submit/Scheduling visit/application-submitted-arabic-verification-choice`
shares its block with the prose `وقد طرحت دعم RTL بوصفه متطلبًا على مستوى النظام لا التفافًا…`.
**Splitting that into two blocks is content's, in Notion.** Nothing built. Reported, per brief.

### Also changed — the chapter pass had no dry run at all

`docs/sync-contract.md` said both writers return early in a dry run. It was worse: for a
chapter row the dry run **never called `writeChapterSections`**. The one pass carrying the
whole bilingual pairing was the one pass `--dry-run` could not preview. It now resolves and
prints, as the cover pass already did, and the shape line carries the Arabic counts —
`result(4¶+1tail/2img ↔ar 4¶)` — so a pairing mismatch is visible before anything is written.
That is also what surfaced (C)'s malformed tag in a dry run for the first time.

**Measured:** `npm run sync:notion -- --dry-run` · `npm run sync:notion` (applied) ·
`npx tsc --noEmit` 0 errors · `npm run lint` 0 · `npm run test:sync` all pass ·
`npm run verify:content` all pass · `npm run check:seed-drift` no drift ·
`npm run build` exit 0. Sync exits 1 on the accessibility tag — **pre-existing**, and it
refuses that page's sections before any delete, so nothing was lost.

**Verified by looking**, `localhost:3000`, dev server, both locales:
`/ar/work/egypt-acquisition/onboarding` renders النتيجة with `dir=rtl`, `lang=ar`, two Arabic
paragraphs and two Arabic figure captions, then the English pointer as the last line. The
figures resolve to the *Arabic* Cloudinary IDs (`…/Arabic/…/application-submitted-arabic-
verification-choice`, `…/branch-selection-arabic`) where the English page resolves to the
English ones — the positional pairing doing the thing it exists for. `/en/…` is unchanged.
Screenshot: `#result` clipped at 1200px.

**Not verified:** only `egypt-acquisition/onboarding` was opened in a browser; the other seven
chapters are confirmed from the database and the sync log, not by looking. No production
build was exercised beyond `next build` — nothing deployed. No accessibility or visual audit.
The 8 pointer lines were not reviewed for whether they *should* stay (see below).

**Open questions — returned to the orchestrator, unanswered:**

1. **Should the pointer stay in `result` at all?** Every chapter page already renders a
   `Next chapter` / `الفصل التالي` navigation block, from data, correctly in both languages,
   directly beneath this paragraph. The prose pointer duplicates it — in English, on the
   Arabic page. Removing it is an editorial call on published copy and is Moataz's; I kept it
   because dropping it would delete a line currently on eight English pages.
2. If it stays, should it become its own field (`chapter_sections.tail` or a
   `kind='pointer'` paragraph) so the frontend can render it as a coda rather than as body
   prose? That crosses schema, sync and components — a decision, not a repair.

---

## 021210826 — 2026-08-21 23:03 — MEASURED, NOT FIXED: `docs/content-brief.md` checked against Supabase and the repo

**Brief:** verify the checkable claims in the new untracked `docs/content-brief.md` — a file
written from a Notion conversation's memory rather than from the database — against what is
actually in Supabase and in the repo. Measurement only. No code, no SQL migration, no fix, and
no edit to the brief itself.

**Files:** none written except this entry. No migration applied. Nothing committed.

**Measured** (Supabase project `cidxctilamdxbzjjzppb`, 2026-08-21 23:00):

| thing | count |
|---|---|
| `chapter_paragraphs` | 252 (248 `kind='prose'`, 4 `kind='table'`) |
| prose ¶ with English | **248 of 248** |
| prose ¶ with Arabic | **139 of 248** — 109 missing |
| `page_sections` | 37 — 37 en, 22 ar. Entire ar gap is one page: `work/egypt-acquisition/accessibility`, **15 en / 0 ar** |
| `entry_handles` | 12 rows — 12 en, 12 ar (**24/24** translation-locale pairs) |
| `chapter_sections` | 57 — 57 en, 55 ar |
| `cover_sections` | 14 — 14 en, 14 ar |
| `cover_paragraphs` | 41 — 41 en, 39 ar (the 2 are UAE `thesis`) |
| `chapter_table_cells` | 88 — 88 en, 88 ar |
| `media` | **76 rows**, not 0 |
| media `alt` | 61 en · 28 ar · **0 rows with no alt in either locale** |
| media `caption` | 58 en · 25 ar |
| inline `[image:<uuid>]` markers | 57 en + 26 ar = **83**, all in the four Egypt chapters |
| `outcomes` / `targets` | 7 / 11 — every row carries an explicit enum status, none null |
| case files | 8 — 4 published, 4 draft (the minis). 1 of 8 has `cover_media_id` |
| chapters | 13 — 10 `kind='chapter'`, all with non-zero `sort_order` |

**The media alt/caption gap is not what the raw counts say.** Split by folder:

| bucket | rows | alt en | alt ar |
|---|---|---|---|
| `…/English/…` | 26 | 26 | 0 |
| `…/Arabic/…` | 17 | 2 | 17 |
| language-neutral | 33 | 33 | **11** |

The first two buckets are locale-specific screenshots — an English-folder image has no Arabic
alt because no Arabic page ever shows it. **The real gap is 22 of 33 neutral images with no
Arabic alt, and 22 of 30 with no Arabic caption**, not "roughly half of 76".

**Verified by running:** `npm run verify:content` (all pass) · `npm run check:seed-drift`
(no drift, 91/91) · `npx tsx scripts/sync-notion.ts --dry-run` — **67 Notion rows read, 39 in
scope, created 0 · updated 21 · skipped 8 · notices 7 · failed 0.** No route collision. Cervello's
entry handles report `3 (3 linked)`. The Neobiz Arabic `why-it-matters` heading now parses (the
alias row `ولماذا يهم رغم أنه لم يتم تطبيقه حتى الآن` is present). The accessibility Arabic page
is still skipped: `Arabic has 8 section(s) to English's 14`.

**Read, not run:** `lib/sync/handles.ts` (the two-arrow parse is resolved — invitation splits on
the first arrow, the pointer is recovered from the *last sentence* of the payoff; `ARROW_RTL`
carries `←`) · `lib/sync/classify.ts` `parseStatusItem` (a bad marker returns an `Error`, the
caller `fail()`s that entity and `continue`s — the row aborts, the sync does not stop; exit code
is 1 at the end if anything failed) · `scripts/sync-notion.ts:1723-1726` (`Order` is the sort key,
`sort_order: row.order ?? 0`) · `lib/media/cloud.ts` (decision 052: cloud name committed) ·
`components/media/CloudinaryImage.tsx:60` (`alt === undefined → return null`, but the locale
fallback means no image is currently dropped).

**Not verified:**
- **Nothing was opened in a browser.** No page was rendered; every number here is a database or
  a file measurement.
- **Nothing on the Notion side.** I did not read a Notion page. Which of the six named missing
  image tags are absent *in Notion* versus dropped by the per-slot pairing gate is not
  distinguishable from the database, and I did not try. The one corroborated case is the Egypt
  `portal` chapter: 14 English-folder images to 13 Arabic-folder, the missing one being the
  Arabic counterpart of `15-group-app-overview-with-queries` — consistent with the brief naming
  `57-group-app-overview-with-queries`, but the chapter also loses 5 Arabic ¶ to the gate, so it
  is corroboration and not proof.
- **The `25 pages In MVP-1` count.** The sync reports 39 rows in scope, where scope is
  `In MVP-1 OR buildLayer = 'Layer 1 — MVP-1'`. Separating the two requires reading Notion.
- The dry run cannot see paragraph-pairing drops (`sync-notion.ts:1115` returns before the loop),
  already recorded 2026-08-21 14:15. Everything above about Arabic ¶ came from the database.

**Open questions returned to the orchestrator:** none blocking. Three findings need a ruling
that is not mine: the four mini case files and `Results Table — Cervello` are still inside the
sync's MVP-1 scope (they emit notices, which are gated on *not* being parked) while the brief
says they were rescoped to MVP-2; and the UAE outcome note `"Reported internally; covers web and
mobile together…"` opens with provenance, which the brief's own §4 and the `metric-integrity`
skill both say stays out of visible copy — while a different paragraph of §4 endorses exactly
that phrasing for a basis. Reported, not touched.

---

*The agent structure was created 2026-08-21 under task `001210826`.*
