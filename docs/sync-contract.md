# docs/sync-contract.md — Notion → Supabase Mapping

**Direction:** one-way, Notion → Supabase. Supabase is the source of truth for the site; Notion is the authoring surface.
**Script:** `scripts/sync-notion.ts`
**Retired at:** Layer 4, when the admin panel writes directly to Supabase. Same tables — no migration.

---

## SOURCE

**Notion database:** Portfolio — Pages & Content
`data_source_id: 7a8ab2e1-08d1-4286-a4df-f2e87b85c219`

Each Notion page has two parts, and the script reads **both**:

1. **Properties** (the table columns) → structural metadata: what this page is, where it goes, whether it ships
2. **Page body** (the content written below the properties) → the actual case-study text that becomes `translations` rows

The page body is where the real writing lives. Properties alone are not content.

---

## STEP 1 — CLASSIFY BY TITLE

The `Page` property encodes the entity type in its prefix. Parse it:

| Title pattern | Entity | Notes |
|---|---|---|
| `Case File Cover — {name}` | `case_files` | |
| `Chapter — {case file} / {chapter}` | `chapters` | parent resolved from the segment before ` / ` |
| `Linear View — {name}` | *(no row)* | derived at render; skip |
| `Results Table — {name}` | `targets` on the parent case file | body parsed into target rows |
| `Comparison — {…}` | `chapters` | flagged as a comparison page |
| `Mini Case File — {name}` | `case_files` | single-chapter case file |
| `Accessibility — {…}` | `chapters` | cross-cutting page attached to its case file |
| `About`, `Contact`, `Systems`, `Philosophy` | ordered prose → `page_sections` (+ `translations` with `entity_type='page_section'`, fields `heading` and `body`) | **Amended by decision 043.** Was `ui_strings` scoped by route; `ui_strings` has no `sort_order` and these pages are ordered multi-section prose whose sequence is the argument |
| `Landing`, `Classic Gallery`, `404` | chrome → `settings` and `ui_strings` | No ordered prose. These pages are complete |

**Rows to skip entirely:** any page whose `Page` begins with `FOUNDATION —`, `The Door —`, `Result Screen —`, `Read —`, `Studio —`, `Experiments —`, `Admin —`, `Ask —`, `Cuts`, `This Website`, `Open-Source`, `How This Site Works`. These are build tasks or future-layer pages, not content.

---

## STEP 2 — PROPERTY MAPPING

| Notion property | Supabase target | Transform |
|---|---|---|
| `Page` | slug + entity type | parse per Step 1; slug derived from `Route` |
| `Route` | `slug` | strip `/[locale]/`, take the final segment; for covers take the case-file segment |
| `Section` | `case_files.domain` | Work → resolved per case file; others map to page grouping |
| `Build Layer` | *(filter only)* | sync only `Layer 1 — MVP-1` unless `--all` |
| `In MVP-1` | *(filter only)* | `__YES__` → include in the MVP-1 sync |
| `Content ready` | `status` | `Done` → `published`; anything else → `draft` |
| `Bilingual` | *(sync hint)* | `EN + AR full` → expect both; `EN first / AR later` → English only, no warning |
| `Est. Days`, `Blockers`, `Development Status`, `Header`, `Footer`, `Purpose`, `Required Content`, `Notes` | *(not synced)* | project-management metadata, stays in Notion |

**`Required Content` is a checklist for the human, not content.** Never sync it as page copy.

---

## STEP 3 — PAGE BODY → TRANSLATIONS

The script reads the Notion page body and maps headings to fields.

**Two kinds of content live under a heading, and they are read differently:**

- **Prose** — paragraphs and list items become the field's text, joined with blank lines.
- **A table** — becomes the heading's *item list*. When a table is present under a heading, it is authoritative and any loose paragraphs above it are treated as prose intro, not as items.

*Corrected 2026-08-11.* This section previously described outcomes as a list. The content is written as a **table**, and the mismatch had a real cost: the parser read a summary sentence sitting above the table as though it were an outcome, and marking it would have written one nonsense row while silently discarding four real ones.

### Chapter pages

| Notion heading | `translations.field` |
|---|---|
| `Title` / page title | `title` |
| `Objective` | `objective` |
| `Context` | `context` |
| `Decision` | `decision` |
| `Evidence` | `evidence_note` |
| `Result` | `result` |
| `Milestone` / `Close` | `milestone` |
| `Features` **(table or list)** | one `features` row per item; item text → `label` |

### A divider closes a section. What follows it is the section's tail

*Rule added 2026-08-23, task `003230826`.*

Every section in this corpus ends with a horizontal rule. **A chapter section
therefore splits in two at its LAST divider** — the `body` before it, the `tail`
after it.

In practice the tail is the cross-chapter pointer, and only ever on an English
`Result`:

```
Result
  …three paragraphs and two figures…
  ────────────────────────────────────
  Next chapter: Application Workflow — the same application, seen from
  inside the bank.
```

**Both halves are written. The split is not a filter.** The tail becomes an
ordinary paragraph in the same slot, in the same order, exactly as before the
rule existed.

**What the split decides changed on 2026-08-23, task `004230826`.** It was
*which paragraphs are counted against which* when the two languages were paired
by position. Nothing is paired any more (see Step 4), so what it decides now is
**the granularity of the English fallback**: `chapter_paragraphs.part` is
`body` or `tail`, and decision 013 resolves per `(section, part)`.

That is why the split outlived the counting it was built for. Eight English
`Result` sections close with a pointer and no Arabic page has one; with one
fallback group per section the pointer would disappear from all eight Arabic
pages. Keeping `tail` separate is what keeps it there, exactly as it renders
today. **Whether it should be there at all is an open editorial question with
Moataz** — every chapter already renders a data-driven `Next chapter` block
directly beneath it. See `docs/status/backend.md` 003230826.

**The test is position, never italics.** An all-italic paragraph is ordinary
content here: four sections end with one *before* their divider, and
`The argument I lost, in two countries` is 5¶ in both languages and pairs on it.
Measured across all seventeen chapter pages in both locales, exactly eight
blocks have anything after their closing divider, and all eight are pointers.

**Why it matters:** no Arabic page has a pointer, so every one of those eight
`result` slots was off by exactly one, the pairing gate refused the pair, and
**32 finished Arabic paragraphs were discarded** — every `result` slot on the
site had zero Arabic except `uae-acquisition/onboarding`, the only English
chapter with no pointer.

**A tail with no Arabic counterpart is reported, not filled.** The English line
stays on the Arabic page under decision 013's fallback. Writing an Arabic one
would be inventing copy.

### Case file covers

| Notion heading | Field |
|---|---|
| page title | `title` |
| `Thesis` | `thesis` |
| `Role` | `role` |
| `Reflection` | `reflection` |
| `Outcomes` **(table)** | one `outcomes` row per table row — see Step 5 |

### The outcomes and targets table

Two columns. A header row is expected and skipped.

| Column | Becomes |
|---|---|
| 1 — label | `outcomes.value` / the `target` translation, **and must carry the status marker** |
| 2 — note | the `note` translation |

```
| ~15 minutes to complete an application [achieved] | Measured in prototype testing, ten documented sessions |
| 1,500+ new SME accounts in year one [projected]   | Controlled release; commercial launch pending          |
```

A summary sentence may sit above the table as prose. It is not an item and is never parsed as one.

### A baseline is not an outcome

*Rule added 2026-08-11.*

The "before" figure a programme was set against — *"2 weeks to 1 month under the paper model"* — does **not** belong in the outcomes table. None of the three statuses fits it honestly: it was not achieved, it is not projected, and it is measurable. It has no marker because it is not that kind of claim.

Put it in the chapter's `Context` prose, attributed to its source. It is more useful there: a baseline stated in context is what makes the other numbers mean anything, whereas the same figure sitting in a results table reads as a claim about the work.

**Body content is stored as Markdown** in `translations.value`, rendered at display time.

---

## STEP 4 — BILINGUAL HANDLING

Arabic content lives as a **child page** under each English page.

### Identifying the child page — prefix and parent, never the full title

The page is identified by **two things and nothing else**: it is a direct child of
the page it translates, and its title **opens with** `النسخة العربية` (the older
bare `العربية` / `Arabic` still matches).

Everything after that prefix is a **human label**. It exists so the pages are
distinguishable in Notion's sidebar, and it varies freely:

```
النسخة العربية — نبذة عني              (under About)
النسخة العربية — الفلسفة                (under Philosophy)
النسخة العربية — الغلاف (مصر)           (under the Egypt cover)
النسخة العربية — الفصل الأول: رحلة فتح الحساب
```

**Nothing in the sync may match on the full title, and no title needs renaming to
suit the script.** The suffix carries no meaning; the script strips it
(`stripArabicScaffolding`) before the title is used for anything.

> ⚠️ This paragraph previously said the child was titled `العربية` **exactly**, and
> the matcher tested for exactly that. No page in Notion has ever been titled that
> way. The result was invisible: a missing Arabic translation is the *normal* state
> under decision 013, so a systematic sync failure and "not written yet" produced
> identical output. **A contract that describes a convention nobody follows is not
> documentation, it is a bug with a paper trail.** Where the script and this file
> disagree, the script is authoritative and this file is wrong — fix it here.

### Headings inside the Arabic page

The Arabic page uses **Arabic headings**, and the script matches them by an alias
map plus prefix, not by literal translation of the English:

| Content | Headings accepted |
|---|---|
| Entry handles | `ثلاثة مداخل` *(prefix — the tail varies)* · `ثلاث طرق للدخول` · `three ways in` |
| Outcomes / results | `النتائج` · `Outcomes` · `Results` |
| Page title echo | The first heading is dropped and becomes the lede **when it matches the child page title with the prefix stripped** — see below |

### Separators are direction-aware

An entry handle is `<invitation> ← <payoff>` in Arabic and `<invitation> → <payoff>`
in English. **`←` is the forward arrow in RTL** (see the `rtl-guard` skill), so the
Arabic parser accepts `←` and `⬅`; the English parser does not, because `←` appears
in English copy as hierarchy notation (`Instance ← Organisation ← Team ← Project`)
and splitting on it would cut a sentence in half.

### A CHAPTER'S PROSE DOES NOT PAIR. EACH LOCALE HAS ITS OWN SEQUENCE

*Rewritten 2026-08-23, task `004230826`, against migration 0045.*

**A paragraph is not a translatable unit. A section is.** English has N
paragraphs, Arabic has M, and both are correct — the Arabic is written from
inside the language and splits where the English joins. `neobiz-mobile/portal`
says its `context` in 2 English paragraphs and 5 Arabic ones. Neither is a
translation of a row in the other.

`chapter_paragraphs` therefore carries a `locale`. A section owns **two
independent sequences**, and the sync writes each from its own page:

```
chapter_sections   slot = 'context'          ← shared, resolved per locale
                                                by the alias table
chapter_paragraphs locale='en'  sort 0..10   ← the English sequence
                   locale='ar'  sort 0..12   ← the Arabic sequence
```

**This is the rule Step 6 has always applied to images:** *"each locale's body
carries its own sequence, and there is nothing to pair."* Prose now follows it.
There is no principled difference between the two.

**The English fallback survives, and moves up a level.** Decision 013 resolves
per `(section, part)` rather than per paragraph: an Arabic section with no
Arabic body serves the English body **whole**, marked `lang="en"` so
`rtl-guard`'s text-direction rule still applies. That is stricter than what it
replaces — the old shape could render a section half Arabic and half English,
paragraph by paragraph, which is worse than either.

**Tables move with the prose.** A table is a paragraph, so each locale's table
is its own row with its own cells. The grid-shape check that guarded cell-level
pairing is gone with the pairing, not weakened: there is no longer an index to
pair on.

**A section that exists only in Arabic is reported, not written.** A chapter's
slots come from the English page, and inventing an English-less section would
be a decision about what the English page shows. Measured 2026-08-23: zero
across all seventeen chapter pages.

### What still pairs by position, and still refuses on a mismatch

**Untouched — the guard is right wherever two lists really are the same list:**

| | Pairs by position |
|---|---|
| Entry handles | yes |
| Outcomes and targets | yes |
| Decisions | yes |
| Cover sections and **`cover_paragraphs`** | yes — see below |
| `page_sections` | yes |
| Chapter prose paragraphs | **no longer — migration 0045** |
| Chapter table cells | **no longer — they follow their paragraph** |
| Image tags | never did (Step 6) |

Where the counts differ, the Arabic is **skipped and reported** — attaching the
wrong Arabic to the wrong row is worse than showing English. This also applies
when *some* lines in a list fail to parse: a partial list whose count happens to
equal English's is refused, because it would pair silently and wrongly.

Every such notice prints **both heading lists**, so "not translated yet"
(Moataz's work) can be told apart from "the parser split it differently" (a
bug). Those need opposite responses and are indistinguishable from a count
alone.

> ⚠️ **`cover_paragraphs` has the identical defect and it is NOT fixed.**
> Covers keep one shared paragraph row per position, so the UAE cover's
> `thesis` — 2 English paragraphs, 3 Arabic — is refused on every sync.
> Measured 2026-08-23: `cover_paragraphs` 41 rows, 41 en, **39 ar**. Two
> paragraphs, one slot, one cover. It is the same fix in a second table and is
> deliberately out of task `004230826`'s scope, not overlooked.

> The bug class this replaced, in its exact form: two lists zipped by position,
> guarded by equal length, where **equal length was never the question**.
> `003230826` fixed one instance of it by separating a body from a coda so the
> counts stopped lying. This removes the question instead — **the remedy for a
> pairing that should not exist is to delete the index, not to widen the
> guard.**

### The rest

- English body → `translations` rows with `locale = 'en'`
- Arabic child page body → same fields, `locale = 'ar'`
- **Missing Arabic is normal.** Do not warn, do not block. The English fallback rule in `docs/schema.md` covers it.

> The fallback is what makes every failure above silent, and is still correct
> (decision 013). The mitigation is not to remove it but to make the sync **say**
> when it found Arabic and refused it — which is what the notices now do.

---

## STEP 5 — OUTCOMES & TARGETS (the integrity rule)

Outcome and target items must carry an explicit status marker. The script parses it and **fails loudly if absent** — it must never guess.

The marker goes in the **first column** of the table (see Step 3), and the second column is the note:

```
| 1,500+ SME accounts [projected]              | Controlled release; commercial launch pending |
| Live over a year and a half [achieved]       | Verified against production telemetry         |
| Completion time reduction [not-measurable]   | No baseline captured                          |
```

- Marker → `outcomes.status` / `targets.status`
- Text before the marker → `translations.field = 'label'` / `'target'`
- Second column → `note`

**The note is not decoration.** A figure marked `[achieved]` on prototype evidence is defensible only if the note says so — the marker records *whether* it happened, the note records *how it is known*. That distinction is what survives an interview.

A legacy prose form (`label [status] — note` on one line) is still parsed if no table is present.

**If a status marker is missing, abort the sync for that row and report it.** No defaults. This is how the no-fabrication rule survives automation.

---

## STEP 6 — MEDIA

*Rewritten 2026-08-19 against the actual Notion body. The format below was specified and never implemented, and the specification did not match what was written: it had no slot for a caption, and every tag in Notion carries one.*

Images are **not** synced from Notion. The binary is uploaded to Cloudinary by hand; Notion carries only the reference.

### The tag, as it is actually written

A tag is **one paragraph block containing three inline code spans and nothing else**:

```
`[cld] <public id>`  `[alt] <alt text>`  `[caption] <caption>`
```

Read from `annotations.code`, **not** by matching backticks. Notion's `plain_text`
strips the backticks, so a regex over joined text is matching punctuation that is
not there. A paragraph is a tag when its first code span opens with `[cld]`.

- **All three parts are required.** A tag missing `[alt]` or `[caption]` fails the chapter (see below).
- Public IDs contain spaces, dots, parentheses and apostrophes. They are used verbatim — never slugified, never URL-encoded at this layer. Cloudinary resolves them as-is.
- The tag paragraph is a **sibling** of the prose paragraphs, never inline within one. This is what lets a `<figure>` render between paragraphs rather than inside one.

### What the sync does with it

1. Upsert a `media` row keyed on `cloudinary_public_id`, which is unique. Re-running matches the existing row and never duplicates.
2. Write `alt` and `caption` into `translations` with `entity_type='media'`, `entity_id = media.id`, for **the locale of the page the tag was read from**.
3. Replace the tag, in the body text stored in `translations`, with `[image:<media.id>]`.

**Notion is never rewritten.** The public ID, alt and caption stay in the Notion body exactly as authored; the UUID substitution exists only in the copy stored in Supabase.

### `redacted` is false, always

`media.redacted = false` on every row this step writes. Amendment 036 supersedes 027: these are design files carrying dummy data, the NDA treatment is a grayscale *signal* driven by `case_files.nda`, and `redacted = true` would additionally force the non-cropping `redacted` preset (decision 028) for no reason.

### A locale references its own screens

English and Arabic pages do **not** reference the same public IDs. Chapter One shares only 4 of 16: the two paper AOF pages, and the two Arabic screens the English prose discusses. The other 24 appear in one locale only — an Arabic page shows Arabic screenshots.

**Consequence:** a `media` row carries alt and caption for the locales that reference it, which is often one, not both. This is not a missing translation and must not be reported as one. Positional pairing (Step 4) does **not** apply to image tags: each locale's body carries its own sequence, and there is nothing to pair.

### ⚠️ THE `page_sections` PATH IMPLEMENTS NONE OF THIS

*Established 2026-08-23, task `003230826`. Diagnosis only — nothing was built.*

**Step 6 exists on the chapter-section path and nowhere else.** A page written
through `page_sections` writes **zero** `media` rows, for every tag on it, in
both languages. This is structural rather than a bug in the write:

- `readOrderedBlocks` keeps image tags out of `lines` and puts them in `items`.
- `parsePageSections` reads `heading`, `lines` and `tables`. **It never looks at
  `items`**, so a tag is not skipped by a rule — it is never seen.
- `page_sections` has one `body` text column per section. There is no paragraph
  list to hold a figure's position, so there is nowhere for `[image:<uuid>]` to
  mean anything even if it were written.

**Measured on the accessibility page** — the only MVP-1 page still on this path:
18 usable `[cld]` tags in English, 18 in Arabic (17 usable, 1 malformed). Of the
19 distinct public IDs, **14 have no `media` row**; the 5 that do got them from
chapter pages that reference the same screens.

**The fix is not to teach `page_sections` about media.** It is to finish moving
this page onto the slot model, which already implements Step 6 in full and is
the reason the comparison pages migrated. That migration is blocked by exactly
one thing, and the sync already names it on every run:

```
Accessibility — … (ar): image tag "…/Arabic/Post-Submit/Scheduling visit/
application-submitted-arabic-verification-choice" is unusable and was NOT written:
  - the paragraph also contains prose ("وقد طرحت دعم RTL بوصفه متطلبًا …")
```

One Arabic paragraph in Notion holds a tag and a sentence together. Splitting it
into two blocks is a **content** change, in Notion, and it is the whole blocker.

### Images uploaded into Notion are ignored

A Notion `image` block is **not** content. Those are the author's own working previews, and their URLs are signed and expire in 300 seconds — storing one would produce a dead link within five minutes. `readBody` reads only headings, paragraphs, list items and tables, so `image` blocks are already skipped structurally. Chapter One's `The interface` section holds 5 of them and syncs none.

### A missing alt fails loudly

`CloudinaryImage` **omits** an image whose `alt` translation is absent — deliberately, so an unlabelled image cannot ship. On a page that is an invisible gap: nothing renders and nothing complains.

The sync therefore refuses to be the quiet half of that pair. A tag whose `[alt]` is missing or empty **fails its chapter** through the existing failure policy — reported by name, nothing written for that entity, the rest of the sync continuing. The rule is the same one Step 4 states: candidates found is compared against candidates kept, and a difference is a refusal, not a silent drop.

---

## BEHAVIOUR

**Idempotent.** Match on `slug` (and `case_file_id + slug` for chapters). Upsert, never duplicate. Re-running is always safe.

**Deletions are not propagated.** Removing a Notion page does not delete the Supabase row — it must be archived manually. This prevents accidental content loss.

**Dry run:** `--dry-run` reports every create, update, and skip without writing.

### FAILURE POLICY — completeness, not just equality

A missing status marker or an unparseable title aborts **that entity** and reports
it; the rest of the sync continues; partial or guessed data is never written.

That policy now extends to **positional pairing**, which is how every Arabic list
is attached to its English counterpart. Pairing by index is only valid if both
lists are complete, and the guard used to be **length equality alone**. Equality is
necessary and **not sufficient**:

> The UAE cover had four candidate handle lines. One was dropped silently. The
> surviving three matched English's three, the length check passed, and Arabic
> handle 3 would have been published under English handle 2.

The drop and the guard measured different things, so a coincidental match read as
success. Every pairing site therefore now compares **candidates found** against
**candidates kept**, and refuses when they differ.

**A candidate is something that announced itself.** This distinction is what makes
the rule usable rather than paralysing:

| | Counted? |
|---|---|
| A heading that opens `Decision ·` and has no name after it | **Yes — a drop.** Something was meant to be there |
| A table row whose label is empty once the marker is stripped | **Yes — a drop** |
| A block with no heading, no body and no table | **Yes — a drop** |
| A line opening `ملف شقيق:` under the handles heading | No — a sibling, never a handle |
| Headings like `Objective`, `Context`, `Result` in a chapter body | No — they were never decisions |

Implemented once in `lib/sync/sift.ts` and used at each site, rather than four
copies of the same counting.

**What a refusal does:** the Arabic for that entity is dropped **as a whole set** —
never partially — the English is written unchanged, and a notice names *what* was
dropped and *why*. A count alone ("kept 3 of 4") is a guard that sends someone
hunting; the offending line is the answer, and it distinguishes "a separator the
parser does not know" from "a stray paragraph that was never a handle".

**Known asymmetry, stated rather than hidden:** the ENGLISH handle loop does not
count its drops — a line that fails to parse is silently ignored. English is the
source of truth, so a silent drop there means content missing from the published
page rather than a missing translation. This is a gap, not a decision.

**Order of operations:**
1. Fetch all Notion pages, filtered by Build Layer / In MVP-1
2. Classify by title; skip non-content rows
3. Upsert `case_files` first (chapters need parent IDs)
4. Upsert `chapters`, `features`, `outcomes`, `targets`
5. Upsert `translations` for `en`, then `ar` from child pages
6. Upsert `media` from body references
7. Write a `revisions` snapshot per changed entity
8. Trigger `/api/revalidate` for affected routes
9. Print a summary: created / updated / skipped / failed

**Failure policy:** a missing status marker (Step 5) or an unparseable title aborts that entity and reports it. The rest of the sync continues. Never write partial or guessed data.

---

## ⚠️ KNOWN LIMITATION — `--dry-run` DOES NOT RAISE PAIRING NOTICES

**Narrowed 2026-08-23, task `003230826`. Two of the three things this section
described are fixed; the third stands. Read the corrections before the rest.**

**CORRECTION 1 — the chapter pass was not previewed at all.** This section
described `writeChapterSections` returning early in a dry run. It was worse than
that: for a chapter row the dry run **never called it**, and printed only
`chapter egypt-acquisition/onboarding` with no shape line. The one pass carrying
the whole bilingual pairing was the one pass a dry run could not see. It now
resolves and prints, exactly as the cover pass already did.

**CORRECTION 2 — the shape line now carries the Arabic counts.** It reads
`result(4¶+1tail/2img ↔ar 4¶)`. The claim below that `+ar` means only "an
Arabic section was found" is still true of `writeCoverSections`, which is
unchanged.

**CORRECTION 3 — chapter prose no longer pairs at all** (2026-08-23, task
`004230826`, migration 0045). The shape line's two counts are no longer a
prediction of whether a slot will be refused: differing counts are now the
normal, correct case, and both sequences are written. The line is still the
diagnostic that matters — a count that CHANGES is how a silent drop becomes
visible — but it no longer forecasts a refusal, because there is none to
forecast.

**WHAT STANDS:** the writers still return before the write loop, so a
`notice()` raised inside it is not emitted by a dry run. For chapters that is
now only the tail-gap notice; every refusal notice that mattered here is gone
with the pairing. **Covers still pair, still refuse, and still say nothing
about it in a dry run.**

**And do not carry a number out of this document.** It said "109 chapter
paragraphs", which was true when written and is not now. Run the query:

```sql
-- Since 0045 the locale is on the paragraph row, so this counts SEQUENCES,
-- not translations of a shared row. `en` and `ar` differing is normal.
select cf.slug||'/'||c.slug as ch, cs.slot, cp.part,
 count(*) filter (where cp.locale='en') as en,
 count(*) filter (where cp.locale='ar') as ar
from chapters c join case_files cf on cf.id=c.case_file_id
join chapter_sections cs on cs.chapter_id=c.id
join chapter_paragraphs cp on cp.chapter_section_id=cs.id
group by 1,2,3, cs.sort_order order by 1, cs.sort_order, 3;
```

**A slot with `ar = 0` is the thing to look at.** That is a section serving the
English fallback whole — either not written in Arabic yet, or dropped.

### Why

Both section writers return their summary line and stop before doing any work —
search `if (DRY_RUN) return shape;` in `writeChapterSections` and
`writeCoverSections`:

```ts
if (DRY_RUN) return shape;   // ← everything below is unreachable in a dry run
```

The `notice()` that explains a refused pairing lives *after* that line.

**What the dry run DOES catch** is everything decided before the return:
classification, slot resolution and its refusals, outcome/target parsing,
entry-handle pointers, section-count mismatches at page level, invalid image
tags, and — since this task — every chapter slot's `en ¶ / ar ¶ / tail` counts.
The Neobiz alias failure, the accessibility page's 8-vs-14 and its one
malformed Arabic tag all show up correctly. What remains invisible is the
**wording** of a pairing refusal, not the fact of one.

### How it was found

Not from the sync. From the database: section *headings* were translated while
their paragraphs were not — 6 of 7 headings and 5 of 41 paragraphs on
`egypt-acquisition/workflow` — which cannot happen if the Arabic page were
missing. The Arabic page for that chapter is complete.

### What it would take to fix (NOT built)

The honest fix is to separate *deciding* from *writing*, so a dry run can run
the whole decision path and skip only the database calls:

1. Split each writer in two — a pure function that takes the English and Arabic
   block trees and returns a plan (`{slot, position, arabicAccepted, reason}[]`
   plus the notices it would raise), and a thin writer that executes the plan.
2. Move the `DRY_RUN` check from the top of the writer to the point of each
   `insert`/`upsert`, or have the dry run simply not call the executor.
3. Report the plan: the dry run prints per-slot `en ¶ / ar ¶ / paired?` and
   every notice the real run would emit.

The cost is real — it is a restructure of the two largest functions in the
script, and their current shape is what makes the delete-and-replace semantics
easy to follow. The cheaper interim is a `--explain` flag that runs the pairing
comparison and prints its verdict without writing, duplicating the count logic
in one place rather than restructuring. **Duplicated logic is exactly how these
two paths drifted apart in the first place**, so it is a stopgap and should be
labelled one.

### Until then

**Verify Arabic coverage against the database, not against a dry run.** The
per-entity query is in `docs/status.md` (2026-08-21 14:15). The tell for this
failure is always the same: a section heading with Arabic sitting above
paragraphs without it.

---

## KNOWN DATA ISSUES (resolve in Notion before the first real sync)

1. **Route collision** — two rows claim `/[locale]/work/cervello`: `Case File Cover — Cervello` (old) and `Case File Cover — Cervello Cloud (IoT)` (current). The sync will create duplicates or overwrite unpredictably.
2. **Five orphaned Cervello chapters** — IoT Platform Web App, Design System, Alarm iOS App, Horizontal Apps, Platform Website — superseded by the three-chapter rebuild.
3. **Mini case files** still flagged `In MVP-1 = __YES__` with no content written.
4. **Stale blockers** on Neobiz Mobile chapters marked `Content ready = Done`.

The script must not paper over these. Fix the source.
