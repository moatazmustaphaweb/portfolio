-- 0045 — A PARAGRAPH IS NOT A TRANSLATABLE UNIT. A SECTION IS.
--
-- ── WHAT WAS WRONG ──────────────────────────────────────────────────────────
--
-- `chapter_paragraphs` held ONE row per paragraph, shared by both languages,
-- with the English text and the Arabic text hanging off it as two
-- `translations` rows. That shape asserts a 1:1 correspondence between an
-- English paragraph and an Arabic one.
--
-- The content never had that correspondence. The Arabic is written from inside
-- the language, not translated line by line: it splits where the English joins
-- and joins where the English splits. Measured against Notion on 2026-08-23:
--
--   egypt-acquisition/fulfilment  context                 15 en ¶  ·  16 ar ¶
--   egypt-acquisition/workflow    context                 11 en ¶  ·  13 ar ¶
--   egypt-acquisition/workflow    what-v1-got-wrong       10 en ¶  ·   7 ar ¶
--   egypt-acquisition/workflow    how-problems-were-found  6 en ¶  ·   7 ar ¶
--   egypt-acquisition/onboarding  what-i-designed         14 en ¶  ·  13 ar ¶
--   neobiz-mobile/portal          context                  2 en ¶  ·   5 ar ¶
--   … twelve slots in all
--
-- Because the rows are shared, the sync could only attach Arabic by POSITION,
-- and pairing by index across lists of different lengths would put the wrong
-- Arabic paragraph — and, where figures sit in the sequence, the wrong
-- screenshot — under the wrong English one. The gate that refuses that pairing
-- is correct and stays. What was wrong is the model underneath it: it forced a
-- gate to exist for a question the content never asked.
--
-- The cost was 67 finished Arabic paragraphs discarded on every sync.
--
-- ── THE PRECEDENT IS ALREADY IN THE CONTRACT ────────────────────────────────
--
-- `docs/sync-contract.md` Step 6, on images:
--
--     "each locale's body carries its own sequence, and there is nothing
--      to pair."
--
-- Images already accept that the two locales differ in count and order. Prose
-- did not, and there was no principled reason for the difference. This
-- migration brings prose to the rule images already follow.
--
-- ── THE SHAPE ───────────────────────────────────────────────────────────────
--
-- A paragraph row now belongs to ONE locale. A section owns two independent
-- sequences: its English paragraphs and its Arabic paragraphs. Neither is a
-- translation of a row in the other, and neither constrains the other's length.
--
-- `translations` still holds every human-readable string (rule 1) — an `en` row
-- carries only an `en` translation, an `ar` row only an `ar` one. That is what
-- keeps `resolveManyDetailed` able to say which language actually supplied a
-- string, which decision 053 needs to mark English served into an Arabic page.
--
-- ⚠️ THE FALLBACK MOVES FROM THE PARAGRAPH TO THE (SECTION, PART) PAIR, and
-- that is an improvement rather than a side effect. Under the old shape a
-- section could render half Arabic and half English — paragraph by paragraph,
-- whichever happened to have a translation. It now renders one language or the
-- other. Decision 013 is unchanged: a section with no Arabic serves the English
-- sequence, marked `lang="en"` so `rtl-guard`'s text-direction rule still
-- applies.
--
-- ── WHY `part` EXISTS, AND WHY IT IS NOT A FILTER ───────────────────────────
--
-- `part` records the divider split introduced in task `003230826` (see
-- `docs/sync-contract.md` Step 3): a chapter section splits at its LAST
-- horizontal rule into a `body` and a `tail`, and in this corpus the tail is
-- always the cross-chapter pointer, only ever on an English `Result`.
--
-- Under the old shape the split existed so the two languages were COUNTED
-- correctly. Counting is gone. What the split still decides is the GRANULARITY
-- OF THE FALLBACK, and dropping it would change what a reader sees: eight
-- Arabic `Result` sections currently render their Arabic paragraphs followed by
-- the English pointer, because the pointer falls back on its own. With one
-- fallback group per section the pointer would vanish from all eight Arabic
-- pages — an editorial change, not a repair, and not this task's to make.
--
-- So the fallback resolves per (section, part): the Arabic body if there is
-- one, else the English body; then the Arabic tail if there is one, else the
-- English tail. Rendering order is body then tail, exactly as before.
--
-- Whether the pointer should be in `result` at all is an open question with
-- Moataz — every chapter already renders a data-driven "Next chapter" block
-- directly beneath it. Recorded in `docs/status/backend.md` 003230826.

/* ------------------------------------------------------- locale and part */

alter table chapter_paragraphs
  -- DEFAULTS ARE FOR THE BACKFILL BELOW ONLY. They are dropped at the end of
  -- this file, so the sync must state a locale on every insert. A default
  -- locale is exactly the kind of quiet guess that made a missing translation
  -- indistinguishable from a dropped one.
  add column locale locale_code not null default 'en',
  add column part   text        not null default 'body';

-- TEXT with a CHECK rather than an enum, the same call `kind` and `slot` made:
-- the set is small and closed, and an enum would mean `alter type … add value`
-- in its own migration to add a third part.
alter table chapter_paragraphs
  add constraint chapter_paragraphs_part_check
  check (part in ('body', 'tail'));

-- Two locales now occupy the same section, so `sort_order` is unique per
-- locale, not per section. Body numbering starts at 0 and the tail continues
-- from it, so a single `order by sort_order` still reproduces the written
-- order within one locale.
alter table chapter_paragraphs
  drop constraint chapter_paragraphs_chapter_section_id_sort_order_key;

alter table chapter_paragraphs
  add constraint chapter_paragraphs_section_locale_sort_key
  unique (chapter_section_id, locale, sort_order);

drop index if exists chapter_paragraphs_section_idx;
create index chapter_paragraphs_section_idx
  on chapter_paragraphs (chapter_section_id, locale, sort_order);

/* --------------------------------------------------------------- backfill */

-- The sync rebuilds every chapter from Notion and is idempotent, so this
-- backfill is a safety net rather than the delivery mechanism. It is written
-- anyway because a migration that drops finished Arabic on the way past is the
-- same failure this migration exists to end.
--
-- Every existing row becomes the ENGLISH row (the `locale` default above).
-- Every row that carries Arabic text — as a body translation, or as Arabic
-- table cells — gains an Arabic twin at the same position, and its Arabic
-- translations MOVE to the twin. Nothing is deleted.
--
-- `part` cannot be recovered from the database: the divider that produced the
-- split lives in Notion, not here. Every backfilled row is therefore marked
-- `body`, and the sync in this same task overwrites it with the truth. The
-- consequence of the approximation, until that sync runs, is that an English
-- tail sits in the body group and is not served to an Arabic section that has
-- its own body — one line, on eight pages, for the length of one sync.

-- ⚠️ `materialized` is load-bearing, not decoration. A plain CTE may be inlined
-- into each reference, and `gen_random_uuid()` would then produce a DIFFERENT
-- id for the insert than for the update — the translations would be moved to
-- rows that do not exist. Materialising evaluates it once.

with candidates as materialized (
  select cp.id             as old_id,
         gen_random_uuid() as new_id,
         cp.chapter_section_id,
         cp.sort_order,
         cp.kind,
         cp.part
  from chapter_paragraphs cp
  where exists (
          select 1 from translations t
          where t.entity_type = 'chapter_paragraph'
            and t.entity_id = cp.id
            and t.locale = 'ar')
     or exists (
          select 1
          from chapter_table_cells c
          join translations t
            on t.entity_type = 'chapter_table_cell'
           and t.entity_id = c.id
           and t.locale = 'ar'
          where c.chapter_paragraph_id = cp.id)
),
twins as (
  insert into chapter_paragraphs (id, chapter_section_id, sort_order, kind, locale, part)
  select new_id, chapter_section_id, sort_order, kind, 'ar', part from candidates
  returning id
)
update translations t
set entity_id = c.new_id
from candidates c
where t.entity_type = 'chapter_paragraph'
  and t.entity_id = c.old_id
  and t.locale = 'ar';

-- Table cells belong to a paragraph, so an Arabic twin needs its own grid.
-- Same move, one level down. The twin is re-found by position rather than
-- carried in a mapping table: it is the only `ar` row at that
-- (section, sort_order), which the new unique constraint guarantees.

with pairs as (
  select en.id as old_para, ar.id as new_para
  from chapter_paragraphs en
  join chapter_paragraphs ar
    on ar.chapter_section_id = en.chapter_section_id
   and ar.sort_order = en.sort_order
   and ar.locale = 'ar'
  where en.locale = 'en' and en.kind = 'table'
),
cellmap as materialized (
  select c.id             as old_cell,
         gen_random_uuid() as new_cell,
         p.new_para, c.row_idx, c.col_idx, c.is_header
  from pairs p
  join chapter_table_cells c on c.chapter_paragraph_id = p.old_para
),
mirrored as (
  insert into chapter_table_cells (id, chapter_paragraph_id, row_idx, col_idx, is_header)
  select new_cell, new_para, row_idx, col_idx, is_header from cellmap
  returning id
)
update translations t
set entity_id = cm.new_cell
from cellmap cm
where t.entity_type = 'chapter_table_cell'
  and t.entity_id = cm.old_cell
  and t.locale = 'ar';

/* ------------------------------------------------- no defaults after this */

alter table chapter_paragraphs alter column locale drop default;
alter table chapter_paragraphs alter column part   drop default;
