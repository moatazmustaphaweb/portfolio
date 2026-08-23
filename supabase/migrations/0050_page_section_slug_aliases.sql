-- 0050 — A PAGE SECTION'S STRUCTURAL NAME, WHERE SOMETHING BINDS TO IT.
--
-- ── WHY THIS EXISTS AT ALL ──────────────────────────────────────────────────
--
-- 0048 gave `page_sections` a locale, so each language now owns its own ordered
-- sequence and its own slugs — an Arabic heading slugs to Arabic. That is right
-- for four of the five pages, where the slug is only an anchor id and an Arabic
-- anchor under an Arabic heading is an improvement.
--
-- It is NOT right for `systems`. `app/[locale]/(site)/systems/page.tsx` binds
-- an evidence card to a section BY SLUG:
--
--   const EVIDENCE = {
--     "what-ive-actually-built":            [cervello/method, cervello/permission-architecture],
--     "working-inside-a-system-i-didnt-own": [egypt-acquisition/accessibility],
--   };
--
-- and that binding was written precisely to stop the cards pairing by index —
-- which they used to do, and which bled one section's cards into the next.
-- Under 0048 alone the Arabic Systems page would slug those two sections
-- `ما-بنيته-فعلاً` and `العمل-داخل-نظام-لا-أملكه`, both cards would silently
-- fail to resolve, and the Arabic page would lose two evidence cards that
-- render today. That is a regression, and it is the exact shape `docs/learn.md`
-- warns about: *when a refactor makes some old mechanism unnecessary, check
-- what it was incidentally holding up before deleting it.*
--
-- ── THE SHAPE IS THE ONE THIS PROJECT ALREADY USES TWICE ────────────────────
--
-- `cover_slot_aliases` (0032) and `chapter_slot_aliases` (0036) say the same
-- thing about a different table: **the slot is the structural name, the heading
-- is the prose, and this table exists so the prose does not have to bend.** A
-- new spelling is a ROW, not a deploy.
--
-- The one difference is what is keyed. A cover slot is a small closed
-- vocabulary reused across four case files, so `heading_norm` alone is enough.
-- A page-section slug is unique to its page — `روابط أخرى` is `elsewhere` on
-- About and `also-here` on Contact, the same Arabic words for two different
-- sections — so the page is part of the key.
--
-- And the lookup is on the DERIVED slug rather than the raw heading, so there
-- is exactly one normaliser in the system (`headingToSlug` in
-- `lib/sync/static-pages.ts`) and nothing for a second one to drift from.
--
-- ── WHY ONLY TWO ROWS, AND WHY NOT EVERY ARABIC HEADING ─────────────────────
--
-- An alias only earns its place where something outside the page binds to the
-- slug. Everywhere else the slug is an anchor id, used only within the page
-- that produced it, and an alias there would be a second copy of the content
-- with nothing reading it — a row that can go stale and cannot be noticed.
--
-- Every alias below is therefore load-bearing, which is what makes the guard in
-- the sync proportionate: an alias whose derived slug matches no heading on the
-- page it names FAILS the run. A stale alias means a heading was rewritten and
-- an evidence card is about to disappear; it must not pass quietly. The check
-- runs only when both locales of a page were parsed, so a page whose Arabic
-- child is absent is not reported as an orphan.

create table page_section_slug_aliases (
  -- The `page_sections.page` key: 'systems', 'about/philosophy', … Part of the
  -- primary key because a heading is only unique within its page.
  page         text not null,
  -- headingToSlug(the heading as written, in any language). Locale-agnostic for
  -- the same reason `cover_slot_aliases` is: an Arabic slug and an English one
  -- never collide, and a locale column would discriminate nothing.
  derived_slug text not null,
  -- The structural name the section is known by. Must match the slug the
  -- ENGLISH heading derives, or the binding it exists to preserve is broken in
  -- a second, quieter way.
  slug         text not null,
  -- What binds to this slug, and where the heading was read. Documentation, not
  -- a key: it answers "why is this row here" a year from now, and it is what
  -- tells the next reader whether the row may be deleted.
  observed_on  text,
  primary key (page, derived_slug)
);

-- Enabled with NO POLICY, matching every other content table. That denies
-- everything to the anon key, which is the intent: reads happen server-side
-- through the service role, and this table is read by the sync only.
alter table page_section_slug_aliases enable row level security;

comment on table page_section_slug_aliases is
  'Heading-derived slug → the structural slug a section is known by. Exists only where something outside the page binds to the slug; an orphaned row FAILS the sync.';

/* ------------------------------------------------------------------- seed */

-- Both rows read off the live Notion page `النسخة العربية — الأنظمة` on
-- 2026-08-23, and both derived slugs produced by running `headingToSlug`
-- against those headings rather than typed by hand.

insert into page_section_slug_aliases (page, derived_slug, slug, observed_on) values
  ('systems', 'ما-بنيته-فعلاً',
              'what-ive-actually-built',
              'Systems (ar) — EVIDENCE binds cervello/method + cervello/permission-architecture'),
  ('systems', 'العمل-داخل-نظام-لا-أملكه',
              'working-inside-a-system-i-didnt-own',
              'Systems (ar) — EVIDENCE binds egypt-acquisition/accessibility')
on conflict (page, derived_slug) do update
  set slug = excluded.slug, observed_on = excluded.observed_on;
