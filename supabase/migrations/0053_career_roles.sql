-- 0053 — The career timeline.
--
-- ── WHY ─────────────────────────────────────────────────────────────────────
--
-- Task `043240826`. `CLAUDE.md` has carried this gap since the LLM read test,
-- which named it first: the About design has had a career-timeline component
-- since before the site existed, and it was never built **because there was
-- nothing to put in it**. Moataz supplied the CV on 2026-08-24; the transcription
-- is `docs/career-history.md`. This is the schema half.
--
-- ── EMPLOYER NAMES ARE NOT STORED. THIS IS THE WHOLE POINT ──────────────────
--
-- Moataz's instruction, 2026-08-24, verbatim in substance: **the domain, the job
-- title, the dates, the city and the country — WITHOUT the names.**
--
-- So there is no `employer` column, and adding one later should be a deliberate
-- decision rather than a convenience. He currently works at one of the banks the
-- case files are about; rule 6 keeps client identity out of this repo, and a
-- timeline is exactly where a name would otherwise creep in.
--
-- `docs/career-history.md` DOES carry the employer names — it is a working
-- transcription of a document he supplied, not site content, and nothing reads
-- it. If that ever changes, this comment is the reason it must not.
--
-- ── WHAT IS A COLUMN AND WHAT IS A TRANSLATION ──────────────────────────────
--
-- Structure is a column; prose is a translation. Same split the rest of the
-- schema uses.
--
--   started / ended     dates. `ended` NULL means "present" — the renderer says
--                       so from `ui_strings`, because "Present" is a word and
--                       words are not stored in code (rule 1).
--   sort_order          newest first. Not derived from `started`: the order is
--                       an editorial fact and two roles can share a month.
--
--   title / domain      TRANSLATED. "Lead Product Designer", "IoT" — these are
--   city / country      read by a person and both locales need them.
--
-- City and country are translated rather than stored once because "Madrid" is
-- "مدريد" and "Spain" is "إسبانيا". Storing them as columns would have forced
-- the Arabic page to render Latin place names, which is the same defect
-- decision 053 exists to prevent one layer up.
--
-- ── PER-LOCALE ROWS, LIKE EVERY CONTENT TABLE SINCE 0045 ────────────────────
--
-- `locale` is on the ROW, following `chapter_paragraphs` (0045), `cover_paragraphs`
-- (0046), `page_sections` (0048) and `decisions` (0049). A career is not a
-- paragraph, so the reasoning that drove those — different languages splitting
-- prose differently — does not apply with the same force. But the pattern does:
-- it lets one locale carry a role the other does not, and it keeps the resolver
-- identical across every table rather than special-casing this one.
--
-- ⚠️ NO SEED HERE. The rows are Moataz's own facts, and they have not been read
-- back against the original PDF yet — extraction is lossy and this one arrived
-- with a letter-spacing artefact. Seeding unverified dates would put invented
-- precision on his About page, which is rule 7. The table ships empty and the
-- component renders nothing until he confirms.

create table if not exists career_roles (
  id          uuid primary key default gen_random_uuid(),
  locale      locale_code not null,
  sort_order  integer     not null,
  /* NULL means the role is current. */
  started     date        not null,
  ended       date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  /* A role cannot end before it began. */
  constraint career_roles_dates_ordered check (ended is null or ended >= started),
  /* One position per slot per language. */
  unique (locale, sort_order)
);

comment on table career_roles is
  'The About page career timeline. Employer NAMES are deliberately absent — Moataz asked for domain, title, dates, city and country only, and rule 6 keeps client identity out of this repo. Title, domain, city and country are translations; see migration 0053.';

comment on column career_roles.ended is
  'NULL means the role is current. The word shown for that comes from ui_strings, never from code.';

comment on column career_roles.sort_order is
  'Newest first. An editorial fact, not derived from `started` — two roles can share a month.';

comment on column career_roles.locale is
  'The language this row IS, matching chapter_paragraphs (0045) and page_sections (0048). Lets one locale carry a role the other does not, and keeps the resolver identical across tables.';

create index if not exists career_roles_locale_sort_idx
  on career_roles (locale, sort_order);

alter table career_roles enable row level security;

/*
 * Public read, matching `page_sections` and every other content table. Writes
 * go through the service role, which bypasses RLS — so there is no insert,
 * update or delete policy here on purpose.
 */
drop policy if exists "public reads career roles" on career_roles;
create policy "public reads career roles"
  on career_roles for select
  using (true);
