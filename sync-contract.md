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
| Anything else (`About`, `Contact`, `Landing`, `Systems`, `Philosophy`, `404`, `Classic Gallery`) | static page content → `translations` with `entity_type='ui_string'` scoped by route | |

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

The script reads the Notion page body and maps headings to fields. Expected heading structure inside a chapter page:

| Notion heading | `translations.field` |
|---|---|
| `Title` / page title | `title` |
| `Objective` | `objective` |
| `Context` | `context` |
| `Decision` | `decision` |
| `Evidence` | `evidence_note` |
| `Result` | `result` |
| `Milestone` / `Close` | `milestone` |
| `Features` (list) | one `features` row per item; item text → `label` |

For a case file cover:

| Notion heading | Field |
|---|---|
| page title | `title` |
| `Thesis` | `thesis` |
| `Role` | `role` |
| `Reflection` | `reflection` |
| `Outcomes` (list) | one `outcomes` row each — see Step 4 |

**Body content is stored as Markdown** in `translations.value`, rendered at display time.

---

## STEP 4 — BILINGUAL HANDLING

Arabic content lives as a **child page** under each English page, titled `العربية` (or `Arabic`).

- English body → `translations` rows with `locale = 'en'`
- Arabic child page body → same fields, `locale = 'ar'`
- **Missing Arabic is normal.** Do not warn, do not block. The English fallback rule in `schema.md` covers it.

---

## STEP 5 — OUTCOMES & TARGETS (the integrity rule)

Outcome and target items must carry an explicit status marker in the Notion text. The script parses it and **fails loudly if absent** — it must never guess.

```
1,500+ SME accounts [projected]
Live over a year and a half [achieved]
Completion time reduction [not-measurable] — no baseline captured
```

- Marker → `outcomes.status` / `targets.status`
- Text before the marker → `translations.field = 'label'` / `'target'`
- Text after `—` → `note`

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
