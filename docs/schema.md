# docs/schema.md — Database Schema

**Database:** Supabase (Postgres) · project `cidxctilamdxbzjjzppb`
**IDs:** UUID (`gen_random_uuid()`) everywhere
**Rule:** structure lives in typed tables; every human-readable string lives in `translations`.

---

## TRANSLATION FALLBACK RULE (product decision, enforced in the query layer)

When a translation row is missing for the requested locale, **fall back to English.** Never hide a page, never show an empty section, never show a "not translated" notice. Partial translation is normal and expected.

Implementation lives in `lib/content/translate.ts`:
```
resolve(entity, locale, field):
  1. try translations WHERE locale = requested
  2. else  translations WHERE locale = 'en'
  3. else  return null → caller omits the element entirely
```

**Chapter prose resolves the same way but over a larger unit.** A paragraph is
not a translatable unit, so the fallback there is per `(chapter_section, part)`
rather than per row — see THE CHAPTER SLOT MODEL below. Same rule, coarser
grain, and deliberately: a section half-served by the fallback is not a
bilingual section, it is an untranslated one.

---

## ENUMS

```sql
create type content_status  as enum ('draft', 'published', 'archived');
create type outcome_status  as enum ('projected', 'achieved', 'not-measurable');
create type target_status   as enum ('achieved', 'missed', 'not-measurable');
create type grammar_type    as enum ('country-culture', 'ecosystem', 'design-system');
create type locale_code     as enum ('en', 'ar');
create type article_stream  as enum ('build-log', 'field-notes', 'positions');
create type nav_location    as enum ('header', 'footer');
create type comment_status  as enum ('pending', 'approved', 'spam');   -- Layer 3
create type chapter_kind    as enum ('chapter', 'comparison', 'accessibility');
create type entity_type     as enum (
  'case_file','chapter','feature','decision','outcome','target',
  'article','series','studio_work','experiment',
  'media','nav_item','setting','ui_string'
);
```

---

## MEDIA

```sql
create table media (
  id                    uuid primary key default gen_random_uuid(),
  cloudinary_public_id  text not null unique,
  width                 int,
  height                int,
  format                text,
  redacted              boolean not null default false,
  sort_order            int not null default 0,
  created_at            timestamptz not null default now()
);
```
**Never store URLs.** `redacted = true` triggers the NDA visual treatment. Alt text and captions live in `translations`.

---

## CONTENT STRUCTURE

```sql
create table case_files (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  grammar         grammar_type not null,
  domain          text not null,               -- banking | smart-things | ai | branding
  sort_order      int not null default 0,
  status          content_status not null default 'draft',
  nda             boolean not null default false,
  cover_media_id  uuid references media(id) on delete set null,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- `kind` added 2026-08-12 (amendment 033): comparison and accessibility pages
-- live under a case file and share the chapter route shape, but are NOT part
-- of the numbered narrative and never appear in the linear view.
create table chapters (
  id              uuid primary key default gen_random_uuid(),
  case_file_id    uuid not null references case_files(id) on delete cascade,
  slug            text not null,
  kind            chapter_kind not null default 'chapter',
  sort_order      int not null default 0,
  status          content_status not null default 'draft',
  hero_media_id   uuid references media(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (case_file_id, slug)
);

create table features (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references chapters(id) on delete cascade,
  sort_order  int not null default 0
);

-- Amendment 032: a chapter has as many decisions as it has, ordered.
-- `name` and `body` live in translations under entity_type='decision'.
create table decisions (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references chapters(id) on delete cascade,
  sort_order  int not null default 0,
  locale      locale_code not null,   -- 0049. NO DEFAULT. See PER-LOCALE ROWS below
  unique (chapter_id, locale, sort_order)
);

create table outcomes (
  id            uuid primary key default gen_random_uuid(),
  case_file_id  uuid not null references case_files(id) on delete cascade,
  value         text not null,                 -- '1,500+' · 'over a year and a half'
  status        outcome_status not null,       -- NO DEFAULT: an explicit call every time
  sort_order    int not null default 0
);

create table targets (
  id            uuid primary key default gen_random_uuid(),
  case_file_id  uuid not null references case_files(id) on delete cascade,
  status        target_status not null,        -- NO DEFAULT
  sort_order    int not null default 0
);

-- "Three ways in" (migration 0017). Structure only — `invitation` and `payoff`
-- live in `translations`, deliberately: outcomes keeps copy in `value` AND
-- accepts a `label` translation, and Egypt's outcome rendered twice as a
-- result. One home for the text, one chance to be wrong.
create table entry_handles (
  id                 uuid primary key default gen_random_uuid(),
  case_file_id       uuid not null references case_files(id) on delete cascade,
  -- NULLABLE, and null is a normal answer. Filled only when the handle's
  -- pointer names a chapter unambiguously — by title or by "Chapter N".
  -- An unresolved handle renders as text (decision 038).
  target_chapter_id  uuid references chapters(id) on delete set null,
  sort_order         int not null default 0
);

-- Cross-links between case files covering the same requirement in different
-- markets (decision 004). DIRECTED — each cover states its own, in its own
-- words, and the note belongs to the pointing cover (decision 039).
create table case_file_siblings (
  id            uuid primary key default gen_random_uuid(),
  case_file_id  uuid not null references case_files(id) on delete cascade,
  sibling_id    uuid not null references case_files(id) on delete cascade,
  sort_order    int not null default 0,
  constraint case_file_siblings_not_self check (case_file_id <> sibling_id),
  constraint case_file_siblings_unique unique (case_file_id, sibling_id)
);

create table series (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  sort_order  int not null default 0,
  status      content_status not null default 'draft'
);

create table articles (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  stream         article_stream not null,
  series_id      uuid references series(id) on delete set null,
  sort_order     int not null default 0,
  status         content_status not null default 'draft',
  hero_media_id  uuid references media(id) on delete set null,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table studio_works (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  year        int,
  media_id    uuid references media(id) on delete set null,
  sort_order  int not null default 0,
  status      content_status not null default 'draft'
);

create table experiments (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  domain      text,
  state       text,                            -- live | prototype | write-up
  url         text,
  sort_order  int not null default 0,
  status      content_status not null default 'draft'
);
```

**Publish-time check (application-level, not a DB constraint):** a chapter cannot move to `published` without `role`, and without a **decided** decision set, in at least one locale. This is rule 3 of the non-negotiables — it prevents the "we" problem structurally.

> **Amended 2026-08-12 (decision 034).** An explicitly **empty** decision set is allowed. `cervello/method` argues in principles rather than decisions, and those are different things — a decision resolves a specific problem, a principle is a standing rule governing many. The rule forbids an unfilled field, not a considered zero.

---

## THE CHAPTER SLOT MODEL

*Added 2026-08-23, task `004230826`. Migrations 0034–0038 and 0045.*

> ⚠️ **This file is behind on the slot model generally.** `cover_sections` and
> `cover_slot_aliases` are live tables and are **not documented here**. Only the
> chapter side is, plus the `cover_paragraphs` column added in `007230826` and
> the per-locale section below, added in `015230826`. Named so the gap reads as
> known rather than missed; the migrations are the authority until it is closed.

A chapter's prose used to live in six fixed `chapter` translation fields chosen
by matching the Notion heading against a vocabulary in code, and **a heading
outside that list was discarded silently**. Migration 0035 replaced that with
named slots: the slot is structure, the heading text is content, and an
unrecognised heading fails loudly instead of vanishing.

```sql
create table chapter_sections (
  id         uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  slot       text not null,              -- text, not an enum: a new slot is a row
  sort_order integer not null,
  unique (chapter_id, slot)              -- two headings, one slot = a refusal
);

-- The heading text a chapter uses → the slot it fills. A new spelling is a
-- ROW, not a deploy. This is the "data is data" split: which heading maps to
-- which slot is data; the mapping mechanism is code.
create table chapter_slot_aliases (
  heading_norm text primary key,         -- normaliseHeading() in lib/sync/cover-slots.ts
  slot         text not null,
  observed_on  text                      -- documentation, not a key
);
```

### A paragraph is a row, and it belongs to ONE locale

```sql
create table chapter_paragraphs (
  id                 uuid primary key default gen_random_uuid(),
  chapter_section_id uuid not null references chapter_sections(id) on delete cascade,
  sort_order         integer not null,
  kind               text not null,      -- 'prose' | 'table'
  locale             locale_code not null,   -- 0045. NO DEFAULT
  part               text not null,          -- 0045. 'body' | 'tail'. NO DEFAULT
  unique (chapter_section_id, locale, sort_order)
);

create table chapter_table_cells (
  id                   uuid primary key default gen_random_uuid(),
  chapter_paragraph_id uuid not null references chapter_paragraphs(id) on delete cascade,
  row_idx              integer not null,
  col_idx              integer not null,
  is_header            boolean not null default false,
  unique (chapter_paragraph_id, row_idx, col_idx)
);
```

**Why a paragraph is a row and not a joined blob:** an image tag in Notion is
its own paragraph block, so it becomes its own row whose body is exactly
`[image:<uuid>]`, and the renderer emits a `<figure>` as a **sibling** of the
`<p>`s. `<figure>` is invalid inside `<p>` — a joined field would force the
figure to be spliced into the middle of one, and the browser closes the
paragraph early and reparents the rest. That renders *almost* right.

**Why `locale` is on the row and not only on the translation (0045):** a
paragraph is not a translatable unit; a **section** is. English has N
paragraphs and Arabic has M, and both are correct — the Arabic is written from
inside the language and splits where the English joins. A shared row asserts a
1:1 correspondence the content never had, and the position gate protecting that
assertion discarded 67 finished Arabic paragraphs. A section now owns two
independent sequences and nothing is paired. `translations` still holds every
string: an `en` row carries only an `en` row, an `ar` row only an `ar` one,
which is what lets `resolveManyDetailed` report the language that actually
supplied a string (decision 053).

**Why `part` (0045):** a chapter section splits at its **last** horizontal rule
into a `body` and a `tail` — in this corpus the tail is always the
cross-chapter pointer, only ever on an English `Result`. `part` is the unit the
English fallback resolves over, so an Arabic section serves its own body and
still falls back for the pointer that follows it. `sort_order` is one flat
numbering per locale, body first, so a single `order by sort_order` reproduces
the written order.

**The fallback for chapter prose is therefore per `(section, part)`, not per
paragraph** — a strengthening of the rule at the top of this file, not an
exception to it. The old shape could render a section half Arabic and half
English; it now renders one language or the other, marked.

### `is_header` says what NOTION declared, never what row 0 looks like

*Corrected 2026-08-23, task `007230826`.*

The header row was being **dropped on the way in and then re-invented on the
way out**. `readTable` removed Notion's header row — correct for outcomes and
targets, where the header is not an item — and the chapter writer then marked
the surviving row 0 as `is_header`. So the first *data* row of every comparison
table went into `<th scope="col">` and the real headings never reached the
database at all. Live in both locales on both comparison pages and on the
accessibility page, and announced by a screen reader as the column heading for
every cell beneath it.

The two rules were both right and were colliding. `readTable` now returns the
header and the data rows **separately**, and the caller says which it wants:
outcomes and targets read the rows, the chapter and document passes read the
header back in as row 0.

**Whether a table has a header is DATA, not an inference from row 0.** Notion's
table block carries `has_column_header` — the author's own checkbox — and that
is the only thing consulted. A table that declares none is **refused**, because
`SectionTable` is the only table renderer on this site and it draws row 0 in
`<thead>` unconditionally: storing a headerless grid would put a data row in a
`<th>` by the other door. Which row is a header is a content decision.
Measured across the whole Notion database on 2026-08-23: 26 tables, all 26
declare `has_column_header: true`, so the refusal fires on nothing today.

### A cover paragraph belongs to one locale too (0046)

```sql
alter table cover_paragraphs
  add column locale locale_code not null;   -- 0046. NO DEFAULT
-- unique (cover_section_id, locale, sort_order)
```

The same change 0045 made for chapters, applied to covers a task later —
`docs/learn.md` Part 3 already names this shape: *"a rule you apply in one
shape and abandon in another is not yet a rule."* A shared paragraph row forced
Arabic to attach by index, the count gate refused any slot where the two
languages differ, and the UAE cover's `thesis` — 2 English paragraphs, 3 Arabic,
both finished — lost its Arabic on every run. The gate is not loosened; there is
no longer an index to guard.

**No `part` column, and no table cells.** A cover has no coda after a closing
divider, so there is one fallback group per slot; and a cover's tables are its
outcomes, which live in `outcomes` with their own status markers.

---

## PER-LOCALE ROWS — THE WHOLE SET, AND WHERE THE FALLBACK LANDS

*Added 2026-08-23, task `015230826`. Migrations 0048, 0049 and 0050 close the
set 0045 opened.*

Four tables held one row shared by two languages, which asserted a 1:1
correspondence the content never had and forced Arabic to attach by index. Each
now carries a `locale`, each language owns its own sequence, and the count gates
are **unreachable rather than loosened**.

| Table | Since | The unit that is per-locale | Where the English fallback resolves |
|---|---|---|---|
| `chapter_paragraphs` | 0045 | a paragraph | per `(chapter_section, part)` |
| `cover_paragraphs` | 0046 | a paragraph | per cover **slot** |
| `page_sections` | 0048 | a **section** | per **page** |
| `decisions` | 0049 | a **decision** | per **chapter** |

```sql
alter table page_sections
  add column locale locale_code not null;      -- 0048. NO DEFAULT
-- unique (page, locale, slug); index (page, locale, sort_order)
```

**Why the fallback climbs a level each time, and why it cannot stop at the
section.** 0046 could put it on the cover slot because a slot has a
language-independent *name* — `thesis` — that both locales resolve to through
`cover_slot_aliases`. A page section has no such name: **its identity is its
heading, and the heading is prose.** So does a decision: its identity is its
name, and the name is the content.

Falling back per section on the accessibility page would be actively wrong, not
merely unavailable. Its Arabic offers **7 sections to the English page's 14**
with nothing missing — it writes six headed `1 ·`…`6 ·` subsections as six
numbered paragraphs, and folds `The design system contribution` into the
component-library section. Falling back for "the seven it lacks" would serve the
Arabic reader their own content back in English, underneath itself. One sequence
or the other, per page.

Same for `egypt-acquisition/workflow`: 1 English decision, 3 Arabic, and the
third has no English counterpart. Per-decision fallback would publish the same
argument twice on one page, in two languages.

**Nothing marks the language by hand.** An `en` row carries only an `en`
translation, so `withFields` reports `fieldLocales === 'en'` on its own and the
renderer marks it `lang="en"` (decision 053).

### `page_section_slug_aliases` (0050)

```sql
create table page_section_slug_aliases (
  page         text not null,     -- the page_sections.page key. Part of the key:
                                  -- روابط أخرى is `elsewhere` on About and
                                  -- `also-here` on Contact
  derived_slug text not null,     -- headingToSlug(the heading as written)
  slug         text not null,     -- the structural name the section is known by
  observed_on  text,              -- what binds to it. Documentation, not a key
  primary key (page, derived_slug)
);
```

An Arabic heading now produces an Arabic slug, which is the right anchor id and
binds to nothing — **except on Systems**, where the page composition attaches an
evidence card to a section by slug, deliberately, to stop the cards pairing by
index. Two rows keep that binding alive in Arabic.

Same shape as `cover_slot_aliases` and `chapter_slot_aliases` — the slug is
structure, the heading is content, a new spelling is a row rather than a deploy
— with the lookup on the **derived** slug so `headingToSlug` stays the only
normaliser. **An alias matching no heading FAILS the sync**, checked when both
locales of the page were read: an alias exists only where something binds to it,
so a stale one means a card is about to stop rendering silently.

---

## THE TRANSLATION LAYER

```sql
create table translations (
  id           uuid primary key default gen_random_uuid(),
  entity_type  entity_type not null,
  entity_id    uuid not null,
  locale       locale_code not null,
  field        text not null,
  value        text not null,                  -- Markdown for long-form fields
  updated_at   timestamptz not null default now(),
  unique (entity_type, entity_id, locale, field)
);
```

**Common `field` values by entity:**
| Entity | Fields |
|---|---|
| case_file | title · thesis · role · reflection |
| decision | name · body |
| chapter | title · objective · context · decision · evidence_note · result · milestone |
| feature | label · description |
| outcome | label · note |
| target | target · note |
| article | title · excerpt · body |
| media | alt · caption |
| nav_item / setting / ui_string | label / value |

Adding a third language is rows, never a migration. A missing row is partial translation, not an error.

---

## SITE-WIDE DYNAMISM

```sql
-- Corrected 2026-08-11 per decision 026. The previous version declared `key`
-- as primary key then added `id uuid` via ALTER, leaving two identities and no
-- unique constraint on the uuid that translations.entity_id joins to.
-- Now matches its sibling ui_strings.
create table settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,            -- name · tagline · email · linkedin_url · cv_url
  value       text,                            -- locale-independent values (URLs)
  sort_order  int not null default 0
);
-- locale-dependent values (name, tagline) live in translations with
-- entity_type='setting' and entity_id = settings.id

create table navigation (
  id          uuid primary key default gen_random_uuid(),
  route       text not null,
  parent_id   uuid references navigation(id) on delete cascade,
  sort_order  int not null default 0,
  location    nav_location not null,
  visible     boolean not null default true
);

create table ui_strings (
  id       uuid primary key default gen_random_uuid(),
  key      text not null unique,               -- read_more · next_chapter · back_to_work
  context  text
);
```

---

## OPERATIONS

```sql
create table revisions (
  id           uuid primary key default gen_random_uuid(),
  entity_type  entity_type not null,
  entity_id    uuid not null,
  snapshot     jsonb not null,
  created_at   timestamptz not null default now(),
  created_by   text
);

create table sessions (
  id             uuid primary key default gen_random_uuid(),
  started_at     timestamptz not null default now(),
  locale         locale_code,
  referrer_type  text,
  device         text
);

create table events (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references sessions(id) on delete cascade,
  type        text not null,
  payload     jsonb,
  created_at  timestamptz not null default now()
);
```

**Event types:** `page_view · scroll_depth · chapter_complete · entry_handle · door_card · door_budget · door_hypothesis · door_action · door_persona · feedback_response · email_capture · stat_note_seen`

**Privacy (hard constraint):** anonymous session IDs only, no PII in `events.payload`, disclosed on `/how-this-site-works`, aggregate-facing only.

---

## DEFERRED TO THEIR LAYERS

```sql
-- Layer 3
create table comments (
  id           uuid primary key default gen_random_uuid(),
  entity_type  entity_type not null,
  entity_id    uuid not null,
  parent_id    uuid references comments(id) on delete cascade,
  author_name  text,
  body         text not null,
  status       comment_status not null default 'pending',
  created_at   timestamptz not null default now()
);

-- Layer 4 (requires: create extension vector;)
create table documents (
  id           uuid primary key default gen_random_uuid(),
  source_type  entity_type not null,
  source_id    uuid not null,
  locale       locale_code not null,
  content      text not null,
  embedding    vector(1536)
);
```
`documents` is generated *from* published content — never authored directly.

---

## INDEXES

```sql
create index on translations (entity_type, entity_id, locale);
create index on translations (entity_type, entity_id, locale, field);
create index on chapters (case_file_id, sort_order);
create index on features (chapter_id, sort_order);
create index on outcomes (case_file_id, sort_order);
create index on targets (case_file_id, sort_order);
create index on case_files (status, sort_order);
create index on articles (status, published_at desc);
create index on navigation (location, sort_order);
create index on events (session_id, created_at);
```

---

## ROW LEVEL SECURITY

*Corrected 2026-08-11 per decisions 025 and 026. The authoritative version is the applied migration, `supabase/migrations/0001_layer0_schema.sql`.*

```sql
-- Enabled on all 17 tables.
alter table case_files enable row level security;

-- Top-level content: published only.
create policy "public reads published"
  on case_files for select
  using (status = 'published');

-- Child tables have no status of their own — visibility derives from the
-- parent. A chapter is readable only when it AND its case file are published.
create policy "public reads published" on chapters
  for select using (
    status = 'published'
    and exists (select 1 from case_files c
                where c.id = chapters.case_file_id and c.status = 'published')
  );
-- …same shape for features (via chapter), outcomes and targets (via case_file)

-- Site chrome is public by definition.
create policy "public reads media"      on media      for select using (true);
create policy "public reads settings"   on settings   for select using (true);
create policy "public reads ui_strings" on ui_strings for select using (true);
create policy "public reads navigation" on navigation for select using (visible = true);
```

**`translations` has NO select policy — deliberately.** RLS is enabled and no policy exists, so anon is denied by default. Every human-readable string lives in this table, including draft and pre-redaction copy, and the anon key is public by construction. See decision 025. **Do not add a policy here.**

The same applies to `revisions`, `sessions` and `events`: RLS enabled, no policies, service-role access only. Supabase's linter reports these four as `rls_enabled_no_policy` at INFO level — that is the intended state, not a defect.

- **Anon key:** read-only; published content, media, and site chrome only. No access to `translations`.
- **Service role:** all reads of `translations` and all writes (sync script, `/api/events`, later the admin panel) — server-side only, never exposed to the browser
