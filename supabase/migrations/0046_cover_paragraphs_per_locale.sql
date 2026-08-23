-- 0046 — THE SAME RULE 0045 APPLIED TO CHAPTERS, APPLIED TO COVERS.
--
-- ── WHY THIS IS A SEPARATE MIGRATION AND NOT PART OF 0045 ───────────────────
--
-- It should have been part of it. `004230826` moved `chapter_paragraphs` to one
-- row per locale, wrote down why — "a paragraph is not a translatable unit; a
-- section is" — and left `cover_paragraphs` on the old model, where a paragraph
-- row is shared by both languages and Arabic can only attach by index.
--
-- `docs/learn.md` Part 3 already names this exact failure, about a different
-- pair of files: "A rule you apply in one shape and abandon in another is not
-- yet a rule." That entry was written the day before. This is the abandoned
-- shape.
--
-- ── WHAT IT COSTS TODAY ─────────────────────────────────────────────────────
--
-- Measured against the database on 2026-08-23, before this migration:
--
--   cover_paragraphs                41 rows
--   cover_paragraph translations    41 en  ·  39 ar
--
-- The two missing Arabic rows are one slot. The UAE cover's `thesis` is 2
-- paragraphs in English and 3 in Arabic — both finished, both correct, the
-- Arabic simply splits where the English joins — and `writeCoverSections`
-- refuses the whole slot on every run because the counts differ:
--
--     uae-acquisition  thesis   2 en  ·  0 ar   (3 written in Notion)
--
-- The Arabic reader gets the English thesis, marked `lang="en"`, on the cover
-- of the one case file that is live in production.
--
-- ── THE GATE IS NOT LOOSENED. IT IS MADE UNREACHABLE ────────────────────────
--
-- The count gate is correct on its own terms: pairing 2 English paragraphs
-- against 3 Arabic ones by array index would attach the wrong Arabic to the
-- wrong paragraph. Widening it would be the wrong fix, and re-cutting the
-- Arabic in Notion so the counts match is the fix that is always wrong here —
-- Notion is the source, and a defect in the site is fixed in the code.
--
-- What is wrong is the model underneath the gate: one row for two languages
-- forced an index to exist. Give the row a locale and each language owns its
-- own sequence, nothing pairs, and there is no index left to guard.
--
-- ── WHAT IS DIFFERENT FROM 0045 ─────────────────────────────────────────────
--
-- No `part` column. The body/tail split exists because eight English chapter
-- `Result` sections close with a cross-chapter pointer after a horizontal rule
-- and no Arabic page has one. A cover has no such coda: `resolveCoverSections`
-- returns a flat paragraph list with no divider split, so there is one fallback
-- group per section and nothing for a `part` to distinguish.
--
-- No table cells. `cover_paragraphs` holds prose only — a cover's tables are
-- its outcomes, which live in `outcomes` with their own status markers.
--
-- ── THE FALLBACK ────────────────────────────────────────────────────────────
--
-- Decision 013 is unchanged and moves from the paragraph to the SECTION, the
-- same improvement 0045 made: a slot with no Arabic serves the whole English
-- sequence, marked `lang="en"`. The old shape could render a slot half Arabic
-- and half English, paragraph by paragraph, whichever happened to carry a
-- translation. It now renders one language or the other.

/* ------------------------------------------------------------------ locale */

alter table cover_paragraphs
  -- THE DEFAULT IS FOR THE BACKFILL BELOW ONLY and is dropped at the end of
  -- this file, so the sync must state a locale on every insert. A default
  -- locale is the quiet guess that makes a missing translation and a dropped
  -- one indistinguishable.
  add column locale locale_code not null default 'en';

-- Two locales now occupy one section, so `sort_order` is unique per locale.
alter table cover_paragraphs
  drop constraint cover_paragraphs_cover_section_id_sort_order_key;

alter table cover_paragraphs
  add constraint cover_paragraphs_section_locale_sort_key
  unique (cover_section_id, locale, sort_order);

drop index if exists cover_paragraphs_section_idx;
create index cover_paragraphs_section_idx
  on cover_paragraphs (cover_section_id, locale, sort_order);

/* --------------------------------------------------------------- backfill */

-- The sync rebuilds every cover from Notion on each run and is idempotent, so
-- this is a safety net rather than the delivery mechanism. It is written anyway
-- because a migration that drops finished Arabic on the way past is the same
-- failure the migration exists to end.
--
-- Every existing row becomes the ENGLISH row (the default above). Every row
-- carrying an Arabic translation gains an Arabic twin at the same position and
-- its Arabic translations MOVE to the twin. Nothing is deleted.

-- ⚠️ `materialized` is load-bearing, not decoration — the same trap 0045
-- documents. A plain CTE may be inlined into each reference, and
-- `gen_random_uuid()` would then produce a DIFFERENT id for the insert than for
-- the update, moving the translations onto rows that do not exist.

with candidates as materialized (
  select cp.id             as old_id,
         gen_random_uuid() as new_id,
         cp.cover_section_id,
         cp.sort_order
  from cover_paragraphs cp
  where exists (
    select 1 from translations t
    where t.entity_type = 'cover_paragraph'
      and t.entity_id = cp.id
      and t.locale = 'ar')
),
twins as (
  insert into cover_paragraphs (id, cover_section_id, sort_order, locale)
  select new_id, cover_section_id, sort_order, 'ar' from candidates
  returning id
)
update translations t
set entity_id = c.new_id
from candidates c
where t.entity_type = 'cover_paragraph'
  and t.entity_id = c.old_id
  and t.locale = 'ar';

/* ------------------------------------------------- no default after this */

alter table cover_paragraphs alter column locale drop default;

comment on column cover_paragraphs.locale is
  'The language this paragraph IS, not a language it can be translated into. Each locale owns its own sequence within a slot; nothing pairs by position.';
