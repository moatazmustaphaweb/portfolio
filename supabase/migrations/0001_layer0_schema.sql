-- Layer 0 foundation schema — moatazmustapha.com
-- Source of truth: docs/schema.md, which this follows exactly except for the
-- departures marked [FIX 1], [FIX 2] and [GAP 1] — all approved 2026-08-11 and
-- logged as decisions 025 and 026.
--
-- Applied to project cidxctilamdxbzjjzppb (moatazmustaphaweb) 2026-08-11.
--
-- Deferred to their layers: comments (L3), documents + pgvector (L4).

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

create type content_status as enum ('draft', 'published', 'archived');
create type outcome_status as enum ('projected', 'achieved', 'not-measurable');
create type target_status  as enum ('achieved', 'missed', 'not-measurable');
create type grammar_type   as enum ('country-culture', 'ecosystem', 'design-system');
create type locale_code    as enum ('en', 'ar');
create type article_stream as enum ('build-log', 'field-notes', 'positions');
create type nav_location   as enum ('header', 'footer');
create type comment_status as enum ('pending', 'approved', 'spam');  -- Layer 3

create type entity_type as enum (
  'case_file','chapter','feature','outcome','target',
  'article','series','studio_work','experiment',
  'media','nav_item','setting','ui_string'
);

-- ---------------------------------------------------------------------------
-- MEDIA
-- URLs are NEVER stored. Only the Cloudinary public_id plus a named transform
-- preset, resolved at render by CloudinaryImage.
-- ---------------------------------------------------------------------------

create table media (
  id                   uuid primary key default gen_random_uuid(),
  cloudinary_public_id text not null unique,
  width                int,
  height               int,
  format               text,
  redacted             boolean not null default false,
  sort_order           int not null default 0,
  created_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CONTENT STRUCTURE
-- ---------------------------------------------------------------------------

create table case_files (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  grammar        grammar_type not null,
  domain         text not null,
  sort_order     int not null default 0,
  status         content_status not null default 'draft',
  nda            boolean not null default false,
  cover_media_id uuid references media(id) on delete set null,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table chapters (
  id            uuid primary key default gen_random_uuid(),
  case_file_id  uuid not null references case_files(id) on delete cascade,
  slug          text not null,
  sort_order    int not null default 0,
  status        content_status not null default 'draft',
  hero_media_id uuid references media(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (case_file_id, slug)
);

create table features (
  id         uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  sort_order int not null default 0
);

-- status has NO DEFAULT on purpose: projected-vs-achieved is an explicit call
-- every time. This is decision 007 enforced by the schema.
create table outcomes (
  id           uuid primary key default gen_random_uuid(),
  case_file_id uuid not null references case_files(id) on delete cascade,
  value        text not null,
  status       outcome_status not null,
  sort_order   int not null default 0
);

create table targets (
  id           uuid primary key default gen_random_uuid(),
  case_file_id uuid not null references case_files(id) on delete cascade,
  status       target_status not null,
  sort_order   int not null default 0
);

create table series (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  sort_order int not null default 0,
  status     content_status not null default 'draft'
);

create table articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  stream        article_stream not null,
  series_id     uuid references series(id) on delete set null,
  sort_order    int not null default 0,
  status        content_status not null default 'draft',
  hero_media_id uuid references media(id) on delete set null,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table studio_works (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  year       int,
  media_id   uuid references media(id) on delete set null,
  sort_order int not null default 0,
  status     content_status not null default 'draft'
);

create table experiments (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  domain     text,
  state      text,
  url        text,
  sort_order int not null default 0,
  status     content_status not null default 'draft'
);

-- ---------------------------------------------------------------------------
-- TRANSLATION LAYER
-- Every human-readable string lives here. Adding a third language is rows,
-- never a migration. A missing row is partial translation, not an error.
-- ---------------------------------------------------------------------------

create table translations (
  id          uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id   uuid not null,
  locale      locale_code not null,
  field       text not null,
  value       text not null,
  updated_at  timestamptz not null default now(),
  unique (entity_type, entity_id, locale, field)
);

-- ---------------------------------------------------------------------------
-- SITE-WIDE DYNAMISM
-- ---------------------------------------------------------------------------

-- [FIX 1] docs/schema.md declares `key` as the primary key and then bolts on
-- `id uuid` via ALTER, leaving the table with two identities and — critically —
-- no unique constraint on the uuid that translations.entity_id must join to.
-- This makes it match its sibling ui_strings exactly: uuid identity, unique key.
-- Lookup by key is unchanged and still index-backed.
create table settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      text,
  sort_order int not null default 0
);

create table navigation (
  id         uuid primary key default gen_random_uuid(),
  route      text not null,
  parent_id  uuid references navigation(id) on delete cascade,
  sort_order int not null default 0,
  location   nav_location not null,
  visible    boolean not null default true
);

create table ui_strings (
  id      uuid primary key default gen_random_uuid(),
  key     text not null unique,
  context text
);

-- ---------------------------------------------------------------------------
-- OPERATIONS
-- ---------------------------------------------------------------------------

create table revisions (
  id          uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id   uuid not null,
  snapshot    jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  text
);

-- Privacy is a hard constraint: anonymous session IDs only, no PII in
-- events.payload, disclosed on /how-this-site-works, aggregate-facing only.
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  started_at    timestamptz not null default now(),
  locale        locale_code,
  referrer_type text,
  device        text
);

create table events (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  type       text not null,
  payload    jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
--
-- Anon key: read-only, published rows only.
-- Service role: all writes (sync script, /api/events, later the admin panel),
-- server-side only, never exposed to the browser. The service role bypasses
-- RLS entirely, so no write policies are declared.
-- ---------------------------------------------------------------------------

alter table media        enable row level security;
alter table case_files   enable row level security;
alter table chapters     enable row level security;
alter table features     enable row level security;
alter table outcomes     enable row level security;
alter table targets      enable row level security;
alter table series       enable row level security;
alter table articles     enable row level security;
alter table studio_works enable row level security;
alter table experiments  enable row level security;
alter table translations enable row level security;
alter table settings     enable row level security;
alter table navigation   enable row level security;
alter table ui_strings   enable row level security;
alter table revisions    enable row level security;
alter table sessions     enable row level security;
alter table events       enable row level security;

-- Top-level content: published only.
create policy "public reads published" on case_files
  for select using (status = 'published');
create policy "public reads published" on articles
  for select using (status = 'published');
create policy "public reads published" on series
  for select using (status = 'published');
create policy "public reads published" on studio_works
  for select using (status = 'published');
create policy "public reads published" on experiments
  for select using (status = 'published');

-- [GAP 1] docs/schema.md says "repeat for every content table" without
-- specifying the child tables, which have no status column of their own. Their
-- visibility derives from the parent, so a bare `using (true)` would expose
-- unpublished chapters, features, outcomes and targets. These close that.
create policy "public reads published" on chapters
  for select using (
    status = 'published'
    and exists (
      select 1 from case_files c
      where c.id = chapters.case_file_id and c.status = 'published'
    )
  );

create policy "public reads published" on features
  for select using (
    exists (
      select 1 from chapters ch
      join case_files c on c.id = ch.case_file_id
      where ch.id = features.chapter_id
        and ch.status = 'published'
        and c.status = 'published'
    )
  );

create policy "public reads published" on outcomes
  for select using (
    exists (
      select 1 from case_files c
      where c.id = outcomes.case_file_id and c.status = 'published'
    )
  );

create policy "public reads published" on targets
  for select using (
    exists (
      select 1 from case_files c
      where c.id = targets.case_file_id and c.status = 'published'
    )
  );

-- Site chrome is public by definition — it renders on every page.
create policy "public reads media"      on media      for select using (true);
create policy "public reads settings"   on settings   for select using (true);
create policy "public reads ui_strings" on ui_strings for select using (true);
create policy "public reads navigation" on navigation for select using (visible = true);

-- Operational tables (revisions, sessions, events) get no anon policy at all:
-- RLS enabled with zero policies denies everything to the anon key, which is
-- the intent. Writes happen server-side through the service role.

-- ---------------------------------------------------------------------------
-- [FIX 2] translations — no anon read access. Decision 025.
--
-- docs/schema.md specified `for select using (true)`, which would publish the
-- copy of every DRAFT case file to anyone holding the anon key — and that key
-- is public by construction, shipping in the browser bundle as
-- NEXT_PUBLIC_SUPABASE_ANON_KEY. Unreleased writing, and anything drafted
-- about an NDA project before redaction review, would be readable.
--
-- It cannot be fixed with a join: translations is polymorphic
-- (entity_type + entity_id), so there is no single parent to check.
--
-- Resolution: no select policy for anon. RLS is enabled above, and RLS with
-- zero policies denies by default — so the absence below is the enforcement,
-- not an omission. Content is read server-side through the service role in
-- lib/content/*, which rule 2 and decision 009 already require.
--
-- Consequence: lib/supabase/client.ts (anon) has no content role until
-- comments arrive in Layer 3. Deliberate — do not "fix" this later by adding
-- a permissive policy.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- [FIX 3] Lock down the platform's rls_auto_enable() event-trigger function.
--
-- Supabase ships this SECURITY DEFINER function to auto-enable RLS on new
-- public tables. It is created with the default `EXECUTE ... TO PUBLIC` grant,
-- which anon and authenticated inherit — flagged WARN by the security advisor
-- on two separate lints.
--
-- Practical risk is nil: it returns `event_trigger`, so PostgREST cannot expose
-- it as an RPC and a direct call errors. Revoked anyway as defence in depth.
--
-- Note the grant is on PUBLIC, not on the roles themselves — revoking from
-- anon/authenticated alone is a no-op, because neither ever held a direct
-- grant. Verified after applying: the event trigger still fires (a new table
-- still gets RLS enabled automatically), service_role retains EXECUTE, and
-- both advisor WARNs clear.
-- ---------------------------------------------------------------------------

revoke execute on function public.rls_auto_enable() from public;
