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

Arabic content lives as a **child page** under each English page, titled `العربية` (or `Arabic`).

- English body → `translations` rows with `locale = 'en'`
- Arabic child page body → same fields, `locale = 'ar'`
- **Missing Arabic is normal.** Do not warn, do not block. The English fallback rule in `docs/schema.md` covers it.

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

Images are **not** synced from Notion. Upload to Cloudinary manually, then reference by `public_id` in the Notion body:

```
![alt text](cloudinary:egypt/onboarding-redacted-01){redacted}
```

- Creates/updates a `media` row keyed on `cloudinary_public_id`
- `{redacted}` → `media.redacted = true`
- Alt text → `translations` with `entity_type='media'`, `field='alt'`

---

## BEHAVIOUR

**Idempotent.** Match on `slug` (and `case_file_id + slug` for chapters). Upsert, never duplicate. Re-running is always safe.

**Deletions are not propagated.** Removing a Notion page does not delete the Supabase row — it must be archived manually. This prevents accidental content loss.

**Dry run:** `--dry-run` reports every create, update, and skip without writing.

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

## KNOWN DATA ISSUES (resolve in Notion before the first real sync)

1. **Route collision** — two rows claim `/[locale]/work/cervello`: `Case File Cover — Cervello` (old) and `Case File Cover — Cervello Cloud (IoT)` (current). The sync will create duplicates or overwrite unpredictably.
2. **Five orphaned Cervello chapters** — IoT Platform Web App, Design System, Alarm iOS App, Horizontal Apps, Platform Website — superseded by the three-chapter rebuild.
3. **Mini case files** still flagged `In MVP-1 = __YES__` with no content written.
4. **Stale blockers** on Neobiz Mobile chapters marked `Content ready = Done`.

The script must not paper over these. Fix the source.
