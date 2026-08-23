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

## 015230826 — 2026-08-23 22:32 — the Arabic accessibility page and the workflow chapter's three Arabic decisions are on the site; the per-locale model now covers all four tables

**Brief:** bring `page_sections` and `decisions` onto the per-locale model, the way
`chapter_paragraphs` got it in 0045 and `cover_paragraphs` in 0046 — the last two places the
count gate was discarding Arabic Moataz has written. Tables follow their parent. The gate is
not loosened. `docs/schema.md` and `docs/sync-contract.md` updated in the same task. Plus four
English-only fields to **diagnose and not fix**. Explicitly out of scope and not touched: the
`page_section` media path, which Moataz has deferred.

**Files:** `supabase/migrations/0048_page_sections_per_locale.sql` ·
`supabase/migrations/0049_decisions_per_locale.sql` ·
`supabase/migrations/0050_page_section_slug_aliases.sql` — **all three new, and all three
APPLIED to Supabase: live, with their SQL uncommitted** · `scripts/sync-notion.ts` ·
`scripts/test-sync-logic.ts` · `scripts/probe-locale-fallback.ts` (new) ·
`lib/sync/static-pages.ts` · `lib/content/pages.ts` · `lib/content/chapters.ts` ·
`lib/supabase/database.types.ts` · `docs/schema.md` · `docs/sync-contract.md` ·
`docs/learn.md` · this entry. **Nothing committed — devops owns git.** No scratch files in the
repo; they live under `$CLAUDE_JOB_DIR/tmp`.

---

### MEASURED — the numbers, before and after, from the database

`page_sections`, sections per page per locale, after a full live `npm run sync:notion`:

| page | en | ar before | ar after |
|---|---|---|---|
| about | 7 | 7 | 7 |
| about/philosophy | 5 | 5 | 5 |
| contact | 5 | 5 | 5 |
| systems | 5 | 5 | 5 |
| **work/egypt-acquisition/accessibility** | 15 | **0** | **8** |

Translation fields on the accessibility page: **27 en / 0 ar → 27 en / 14 ar.**

`decisions`: **20 rows → 42** — 20 `en` (40 fields) and 22 `ar` (44 fields).
`egypt-acquisition/workflow` went **1 en / 0 ar → 1 en / 3 ar**.

---

### (A) `page_sections` — AND THE ONE PLACE THE 0046 PATTERN DOES NOT TRANSPLANT

The Arabic accessibility page was never missing. Read block by block off both Notion pages
before writing any code, the two are **split differently**: the English writes `What shipped`
as a container H2 with six H3 subsections `1 ·`…`6 ·`; the Arabic writes the same six as six
numbered paragraphs (`١ ·`…`٦ ·`) inside `ما صدر عن هذا القرار`, and folds
`The design system contribution` into `مكتبة المكونات، باسمها الصحيح`. 7 content sections
against 14, every passage present.

**The fallback could not move to the section, and this is the one respect in which 0048 is not
0046 with the names changed.** 0046 could put decision 013's fallback on the cover *slot*
because a slot has a language-independent name — `thesis` — that both locales resolve to
through `cover_slot_aliases`. **A page section's identity IS its heading, and the heading is
prose.** Per-section fallback on this page would have served the Arabic reader the six numbered
items twice — once in their own Arabic, then again as six English sections underneath — plus
the design-system passage twice. Worse than the bug it replaced.

So `getPageSections` chooses **one sequence or the other for the whole page**: this locale's if
the page has one, else the English one. Same shape for `decisions`, one level up: per
**chapter**, because a decision's identity is its name and the name is the argument.

**The gate is not loosened; it is unreachable.** Pairing 8 Arabic sections against 14 English
by index would have put `سجل المطابقة` under the heading `4 · Error prevention` and its
conformance table under `5 · Confirming instead of typing`. The guard was right. The shared row
that forced an index to exist was not.

**The table follows its parent** and did not regress: the conformance table renders
`الممارسة · معيار WCAG · كيف جرى التحقق` on the Arabic page and
`Practice in the journey · WCAG criterion · Verification` on the English — the `007230826`
header fix intact in both.

### (B) `decisions` — one English decision, three Arabic, and the third has no counterpart

`egypt-acquisition/workflow`: English names one decision that does two things; the Arabic names
them separately (`القرار الأول`, `القرار الثاني`) and adds a third, `القرار الثالث · إظهار
مخارج القرار الخمسة`, which the English page does not have at all. Both finished. `1 !== 3`, so
all three were dropped on every run.

`decisions` never had a uniqueness rule, only an index. 0049 adds
`unique (chapter_id, locale, sort_order)` — with two locales sharing that space it is what makes
an Arabic list a sequence rather than a bag, and it is the constraint 0045 and 0046 both added.

### (C) A REGRESSION I WOULD HAVE SHIPPED, AND THE TWO ROWS THAT STOP IT

Per-locale rows mean an Arabic heading now produces an Arabic slug. That is right everywhere the
slug is an anchor id — **except Systems**, where
`app/[locale]/(site)/systems/page.tsx` binds an evidence card to a section **by slug**,
deliberately, to stop the cards pairing by index. Left alone, `/ar/systems` would have lost two
of its three evidence cards, silently, with a dev-only warning.

`page_section_slug_aliases` (0050) is the third instance of a pattern this project already uses
twice — `cover_slot_aliases` (0032), `chapter_slot_aliases` (0036). The slug is the structural
name, the heading is the prose, a new spelling is a **row**. Two differences: the **page** is
part of the key, because `روابط أخرى` is `elsewhere` on About and `also-here` on Contact; and
the lookup is on the **derived** slug, so `headingToSlug` stays the only normaliser in the
system and there is no second one to drift from.

**Two rows, and both are load-bearing** — an alias exists only where something outside the page
binds to the slug. That is what makes the guard proportionate: **an alias matching no heading
FAILS the run**, checked only when both locales of the page were read. A stale alias means a
heading was rewritten and a card is about to stop rendering with nothing failing.

### (D) The dry run can now preview decisions

Pass 2's dry-run branch `continue`d before the decisions code, so `--dry-run` printed nothing
about the one pass this task changed. It now reports `1 en, 3 ar` before anything is written,
for the same reason the chapter-slot preview was added in `004230826`. The report header stopped
saying *"parsed, NOT written — schema change pending"* (untrue since 0013), and the `⚠️` on an
unequal count is gone — unequal is the normal case now. What is flagged instead is `en > 0,
ar == 0`, the only shape that still makes an Arabic page serve an English list.

---

### VERIFIED

- **`--dry-run` first, then live.** Dry run showed
  `page work/egypt-acquisition/accessibility: en 14 section(s) + intro · ar 8 section(s)` and
  the count-mismatch notice gone; live sync exit 0 on its own terms, `updated 26`, `failed 1`
  (the pre-existing Arabic image tag, below).
- **Looked at the pages, on `localhost:3000`, on the dev server.** `/ar/…/accessibility` renders
  seven Arabic sections and the Arabic conformance table, every heading `lang="ar" dir="rtl"`.
  `/ar/…/workflow` renders all three Arabic decision headings where it rendered one English one.
  `/ar/systems` still renders all three evidence cards — `/ar/work/cervello/method`,
  `/ar/work/cervello/permission-architecture`, `/ar/work/egypt-acquisition/accessibility`.
  `/ar/about`, `/ar/contact`, `/ar/about/philosophy` unchanged.
- **Route sweep: 58/62 returned 200.** The four that did not are
  `/{en,ar}/work/{cervello,uae-acquisition}/results`, which 404 because neither case file has a
  targets table. Pre-existing and correct; outcomes and targets were not touched.
- **The fallback branch is unreachable from live content**, because after this task every page
  and every chapter with decisions has Arabic. So `scripts/probe-locale-fallback.ts` writes a
  probe, reads it back through the real `lib/content` path, and deletes it — same shape as
  `verify-content.ts`'s decision-013 probe. All 9 assertions pass, including
  `fieldLocales === 'en'` on the fallback, which is what lets `ProseSections` mark it
  `lang="en"`. Read back after deleting: 0 probe rows, 0 probe translations left in the database.
  **No npm script for it — `package.json` is devops's file.** Run it with
  `npx tsx --conditions=react-server --env-file=.env.local scripts/probe-locale-fallback.ts`.
- `npm run test:sync` (4 new cases: an alias takes the structural slug, the derived slugs are
  reported, an alias cannot overwrite a slug already claimed, no alias map is a no-op) ·
  `npx tsc --noEmit` · `npx eslint .` · `npm run verify:content` · `npm run check:seed-drift`
  (94/94, no drift) · `npm run build` — **all exit 0.**
- **`check:seed-drift` does not cover 0050's seed, and that is consistent rather than an
  oversight.** It parses `strings(key, context, en, ar)` tuples for `ui_strings` only, so
  `0032_seed_cover_slot_aliases.sql` and `0036_seed_chapter_slot_aliases.sql` are not in
  `SEED_FILES` either. Adding an alias seed to that list would need a second parser and a second
  SQL shape. Named so it reads as known.

### NOT VERIFIED

- **Nothing has been looked at in a browser** — every rendering claim above is `curl` plus DOM
  extraction on `localhost:3000`. No screenshot, no visual pass. Visual verification is Moataz's.
- **No production build was served.** The page checks ran against `npm run dev`; `npm run build`
  passed separately but was not started and swept.
- **The 62-route sweep checked status codes and, on nine pages, headings.** It did not read every
  page's prose.
- **ISR / `/api/revalidate` not exercised.** The dev server reads live.

---

### DIAGNOSED, NOT FIXED — the four English-only fields

**None of them is a count-pairing casualty, so none of them changes what this migration should
cover.** Three are vocabulary gaps in the *legacy* field path; one is not a gap at all.

1. **`neobiz-mobile` `thesis` — the Arabic IS written.** The heading is `الفكرة الأساسية`, and
   `HEADING_SYNONYMS` in `scripts/sync-notion.ts` knows only `الأطروحة`. Note that
   `0032_seed_cover_slot_aliases.sql` **already records this exact spelling** and says so in its
   own comment — so the cover renders its Arabic thesis correctly through `cover_sections`
   (`thesis(3¶ ↔ar 3¶)` on every run). Only the legacy `case_files.thesis` translation field is
   English-only. The alias table has the word; the code map does not.
2. **`egypt-acquisition/onboarding` `evidence_note` — the Arabic IS written.** Heading `الأدلة`
   (plural); `HEADING_SYNONYMS` has `الدليل` (singular). Same shape: `chapter_sections` carries
   it (`evidence(7¶ ↔ar 7¶)`), the legacy `chapters.evidence_note` field does not.
3. **The `media` alt/caption fields are NOT a translation gap.** Measured: 93 `media` rows, 66
   with an English alt, 64 with an Arabic one, **29 English-only and 27 Arabic-only** — close to
   symmetric, because the two locales reference *different screenshots*. An English page shows
   English screens and an Arabic page shows Arabic ones, which `docs/sync-contract.md` Step 6 has
   said since 2026-08-19: *"a `media` row carries alt and caption for the locales that reference
   it, which is often one, not both. This is not a missing translation and must not be reported
   as one."* (The brief said 4; the measured figure is 29/27.)
4. **The four `case_file_sibling` notes — the Arabic IS written, and the parser refuses it.**
   `parseSiblingLine` in `lib/sync/handles.ts:273` requires `[Bracketed]` titles and returns
   `null` without them. The Arabic sibling lines name their siblings in prose — the Neobiz cover
   reads `والملف ذات صله: الاستحواذ في مصر (ويب): وهو معمار الأنظمة الستة…` — so all four are
   dropped. **`looksLikeSiblingLine` was already made deliberately weaker than
   `parseSiblingLine` for this exact reason** (its comment says so, about the UAE cover), which
   stopped the line being counted as a failed handle but never made the note reachable.
   **And the leading `". "` renders because of the same function**, line 280: it strips a leading
   dash and nothing else, so `[Title]: the same regulated journey…` keeps its colon and
   `[Title]. Same bank…` keeps its full stop. Both are in the database now.

---

### FOUND WHILE IN HERE — three things that are not mine to fix

- **The contents rail and the page body disagree, and it is PRE-EXISTING on the English page.**
  `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx:159-166` builds the rail from sections
  with a `heading`; `components/layout/ProseSections.tsx:32` renders sections with a `body`. A
  heading-only section is in one and not the other. Measured on `/en/…/accessibility`: the rail
  has 13 entries, the body has 12, `#what-shipped` is a **dead anchor**, and every rail number
  from 03 down is one higher than the section it points at. `What shipped` is a container H2
  with six H3s beneath it, so the data is correct — the two filters are not. The Arabic page now
  shows the same defect with its own H1 (`قابلية الوصول والاستخدام (Accessibility) في منتج مصرفي
  ثنائي اللغة`, heading with no body). **frontend's, both files.**
- **The English accessibility page publishes an authoring note as its lede.** Rendered at
  `/en/…/accessibility` right now: *"Status: Draft v1 — written from interview, 6 Aug 2026.
  Verified claims and open claims are separated below."* It is the level-0 prose above the first
  heading, which `parsePageSections` treats as the intro. `resolveCoverSections` skips exactly
  this and its comment names this exact sentence — *"authoring notes … must never publish"*. The
  fix is in my file and I have **not** made it: it removes a paragraph from a published page,
  which is a decision rather than a repair, and the About page's lede comes from a *headed* echo
  so a blanket rule would be safe today and not obviously safe tomorrow. **Returning it.**
- **The one `failed` on the live run is unchanged and is content's**, in Notion: the Arabic
  accessibility page has an image tag sharing a paragraph with prose
  (`وقد طرحت دعم RTL بوصفه متطلبًا…`), so the whole page's media is refused. This is the blocker
  on retiring the `page_section` path entirely, and it is the deferred item — **not started, not
  half-implemented.**

**Open questions returned:** the authoring-note lede above. Nothing else.

---

## 007230826 — 2026-08-23 17:20 — the real table headings are on the page again, covers get per-locale paragraphs, and a blank Notion page can no longer unpublish a live case file

**Brief:** three launch-blocking sync defects, ordered by visibility. (A) every chapter
table published its first *data* row as its column headings. (B) a blank duplicate Notion
page unpublishes Cervello on any `--all` run. (C) `cover_paragraphs` still carries the
per-locale defect that migration 0045 fixed for chapters. Not in scope and not touched:
the paragraph-count gate, the `page_section` media path, the Accessibility page's Arabic,
`the-interface`.

**Files:** `scripts/sync-notion.ts` · `lib/content/case-files.ts` ·
`lib/supabase/database.types.ts` · `supabase/migrations/0046_cover_paragraphs_per_locale.sql`
(**new, and APPLIED to Supabase — live, and its SQL is uncommitted**) · `docs/schema.md` ·
`docs/sync-contract.md` · `docs/learn.md` · this entry. **Nothing committed — devops owns
git.** No scratch files left in the repo; they live under `$CLAUDE_JOB_DIR/tmp`.

---

### (A) THE HEADER ROW — TWO CORRECT RULES COLLIDING

`readTable` dropped Notion's header row and the chapter writer then marked the *surviving*
row 0 as `is_header`. Both halves were right on their own. Composed, the first decision of
every comparison table was published as its column headings and the real headings never
reached the database.

**The fix is a split, not a special case.** `readTable(tableId, hasColumnHeader)` now
returns `{ header, rows }` and the caller chooses: outcomes, targets and features read
`.rows` (header dropped — `Claim | Basis` is not a claim); `readOrderedBlocks` reads the
header back in as row 0, which serves both the chapter-section path and the
`page_sections` document path.

**Whether a table has a header is DATA.** Notion's table block carries
`has_column_header` — the author's checkbox — and it is the only thing consulted. Nothing
infers a header from what row 0 looks like. A table that declares none is **refused** and
the run exits non-zero, because `SectionTable` draws row 0 in `<thead>` unconditionally, so
storing a headerless grid would reintroduce the same defect by the other door. Which row
is a header is a content decision.

**Measured, before writing any code:** every table block in the Notion database, walked
including Arabic child pages. **26 tables, 26 with `has_column_header: true`, 0 without.**
So the refusal fires on nothing today and there was no judgement to return.

**Rendered `<th scope="col">`, before and after, on localhost:3000.**

| page | before | after |
|---|---|---|
| `/en/…/web-vs-mobile-portal` | `Reaching an absent customer` · `Email + SMS — both require the customer to go somewhere` · `Push notifications join as a third channel` · `Push goes to the customer instead of waiting for them…` | `The same need` · `Web` · `Mobile` · `Why it changed` |
| `/ar/…/web-vs-mobile-portal` | `الوصول إلى عميل غائب` · `بريد إلكتروني + رسائل قصيرة…` · `تنضم الإشعارات الفورية كقناة ثالثة` · `الإشعار يذهب إلى العميل…` | `الاحتياج نفسه` · `على الويب` · `على الموبايل` · `لماذا تغير` |
| `/en/…/web-vs-mobile-onboarding` | `Overall structure` · `Linear five-stage stepper` · `Task dashboard, five cards with states` · `A stepper shows remaining distance…` | `The same need` · `Web` · `Mobile` · `Why it changed` |
| `/ar/…/web-vs-mobile-onboarding` | `البنية العامة` · `مسار خطي من خمس مراحل` · `لوحة مهام بخمس بطاقات…` · `المسار الخطي يعرض المسافة المتبقية…` | `الاحتياج نفسه` · `على الويب` · `على الموبايل` · `لماذا تغير` |

**It was on six pages, not four.** The accessibility page's table goes through
`page_sections`, not `chapter_paragraphs`, and had the identical defect from the same
helper: `/en/…/accessibility` and `/ar/…/accessibility` both showed
`Text colours (primary, secondary, hint) taken from the bank's shared component library` ·
`1.4.3 Contrast (Minimum)` · `Inherited from the library — not independently measured by me`.
Both now show `Practice in the journey` · `WCAG criterion` · `Verification`. Two more —
`egypt-acquisition/onboarding` (`Finding` · `Count`) and `uae-acquisition/onboarding`
(`Claim` · `Basis`) — are fixed in both locales too.

**A data row was being eaten, not just mislabelled.** Rendered `<th scope="row">` count in
`<tbody>`: portal 4 → **5**, onboarding 12 → **13**. Each table recovered exactly one row.

**Outcomes and targets are untouched, and that was verified rather than assumed.**
Measured from the database after the live sync: `egypt-acquisition` 3 outcomes / 6 targets,
`neobiz-mobile` 5 targets, `uae-acquisition` 4 outcomes — identical to the pre-change dry
run, same markers in the same order. No label reads `Claim`, `Basis`, `Outcome` or
`Source`, so no header leaked in as an item and no item was lost.

---

### (B) A BLANK PAGE CAN NO LONGER UNPUBLISH A LIVE CASE FILE

`caseFileRegression()` runs **before any write and before the dry-run branch**, and
refuses the whole row when either is true:

1. the row would move a `published` case file to `draft`;
2. the Notion page offers zero sections and the published case file already has cover
   sections.

`fail()` + `continue`. Nothing is written for that row, not even the status, and the run
exits non-zero. **A refusal rather than "keep the higher status"** — a merge would stop the
unpublish silently and leave the collision in place with nobody told. The message names
both halves and says the escape hatch: a genuine unpublish is one edit on the **live** page.

The blocks are read at the top of the iteration and reused by both branches, so the guard
reads the same bytes the writer does and this costs no extra Notion calls — one extra
Supabase read per case file.

**Measured, `--dry-run --all`, which is the shape of the run that broke Cervello:**

```
Read 68 rows, 68 in scope.
  case_file  cervello  (published)      ← the live page still syncs
  …
failed   2
  ✗ Case File Cover — Cervello: this page would move the PUBLISHED case file "cervello"
    to draft, which removes it from the gallery and 404s its cover and every chapter
    under it. Nothing was written for this row. …
```

Order-independent: the guard reads the live row's status from the database, so it refuses
whether the blank page is processed before or after the real one.

**`case_files` status after everything, from the database:** `cervello` **published**,
`egypt-acquisition` published, `neobiz-mobile` published, `uae-acquisition` published;
`east` · `kshemam` · `pidetaxi` · `aam-advisor` draft — unchanged, and the guard correctly
does not fire on them because they were never published.

**Decision 040 is not replaced.** Scoping the sync to MVP-1 is still the default and still
right; this is the guard underneath it, because a default protects the path people usually
take and this one was defeated by a flag.

---

### (C) COVER PARAGRAPHS — MIGRATION 0046

The same change 0045 made for chapters. `cover_paragraphs` gains `locale`,
`unique (cover_section_id, locale, sort_order)`, and the count gate in
`writeCoverSections` is gone because there is no longer an index to guard. **No `part`
column** — a cover has no coda after a closing divider, so there is one fallback group per
slot — and **no table cells**, since a cover's tables are its outcomes.

The backfill mirrors 0045's, `materialized` CTE included: every existing row becomes the
English row, every row carrying Arabic gains an Arabic twin at the same position, and the
Arabic translations move to the twin. Nothing deleted.

**Measured from the database.**

| | before | after backfill | after live sync |
|---|---|---|---|
| `cover_paragraphs` rows | 41 | 80 (41 en · 39 ar) | **83 (41 en · 42 ar)** |
| `cover_paragraph` translations | 41 en · **39 ar** | 41 en · 39 ar | 41 en · **42 ar** |
| orphaned `cover_paragraph` translations | — | **0** | **0** |
| `uae-acquisition` `thesis` | 2 en · **0 ar** | 2 en · 0 ar | **2 en · 3 ar** |

**Rendered, on localhost:3000.** `/ar/work/uae-acquisition` carries all three Arabic thesis
paragraphs — `طلب فتح حساب شركة كان يعمل بالفعل على الويب…` · `هذا هو الملف الشقيق لمصر،
والاثنان معًا هما الحجة…` · `نفس المصمم. نفس المتطلب. ونتيجتان لا تشبهان بعضهما.` — and its
`lang="en"` element count went from the English thesis fallback to **0**. Every other cover
is unchanged in both locales: cervello 3/2/3/3, egypt 5/3/6, neobiz 3/4/2/1, all `↔ar` equal.

**The dry-run shape line now prints the Arabic count.** It said `thesis(2¶+ar)` on every run
for the life of the slot model while three finished Arabic paragraphs were being discarded —
`+ar` only meant an Arabic slot existed. It now reads `thesis(2¶ ↔ar 3¶)`, matching the
chapter pass. This is the "absence is invisible" class in the one line whose job is to make
absence visible.

**Two query sites changed in `lib/content/case-files.ts`,** and the second is the one that
would have broken quietly: the gallery/`llms.txt` summary filtered `.eq("sort_order", 0)`,
which after 0046 returns **two** rows per section and would have picked a language by row
order. It now picks this locale's row, else the English one, per section.

---

### VERIFICATION

`npm run test:sync` pass · `npx tsc --noEmit` exit 0 · `npm run lint` 0 errors ·
`npm run verify:content` all checks passed · `npm run check:seed-drift` no drift (91/91) ·
`npm run build` succeeded, 65/65 static pages · live `npm run sync:notion` completed,
26 updated, 1 failure and it is the pre-existing one below.

**Not verified — named as such:**

- **A live `--all` run was refused by the permission classifier and was NOT executed.**
  What *is* verified against live data is the guard's decision: `caseFileRegression` runs
  before the dry-run branch, queries the real database, and returned the refusal on
  `--dry-run --all`. The code path up to and including the refusal is identical. The
  end-to-end live `--all` is untested.
- **No browser.** Every rendered check above is `curl` against `localhost:3000` and
  inspection of the returned HTML — the `<th>` text, the `<th scope="row">` counts, the
  Arabic paragraph strings. Nobody has looked at these tables on a screen, in either
  direction, and an RTL table's mirroring is exactly the kind of thing DOM inspection
  cannot judge. **Moataz's pass is still owed on all six pages.**
- **The refusal for a table with `Header row` off has never fired**, because no such table
  exists. Its message and its `continue` are unexercised.

---

### NOT MINE, FOUND ON THE WAY, NOT DONE

- **frontend + content — an unmarked English sentence on the Arabic UAE cover.**
  `case_file_siblings.note` is English-only (`". Same bank, same regulatory requirement, a
  market without the identity infrastructure, and a very different answer."`), and
  `SiblingLinks` renders it on `/ar/work/uae-acquisition` with **no `lang`/`dir`** — so
  decision 053's marking and `rtl-guard`'s direction rule both miss it. Two rows, both
  English. Separately: **the stored note begins with a literal `". "`** — a leading full
  stop and space that renders on the page. That one looks like a `parseSiblingLine`
  artefact and is mine if it is briefed; I have not touched it.
- **content — the accessibility page's Arabic image tag, unchanged and still the only sync
  failure.** `…/application-submitted-arabic-verification-choice` shares its paragraph with
  prose, so the whole chapter's media is refused. Notion is read-only to me.
- **content — the accessibility page's Arabic, 8 sections to English's 14**, so the
  page_sections pass skips the Arabic. Reported by the sync, out of scope per the brief.
- **Possibly frontend or content — `uae-acquisition/onboarding`'s `result` table renders
  its status markers raw.** Its first cell reads `~10 minutes to complete an application
  [achieved]`, marker and all, because it is a chapter table rather than an `outcomes` row,
  so nothing strips or renders the marker. It is now more legible than before, since the
  `Claim | Basis` header is finally above it. I did not change it — whether that table
  should be an outcomes table is an editorial call.

**Open questions:** none returned. Nothing in the brief needed a decision.

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
