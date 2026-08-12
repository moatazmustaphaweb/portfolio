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
  sort_order  int not null default 0
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
