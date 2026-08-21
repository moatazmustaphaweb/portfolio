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
