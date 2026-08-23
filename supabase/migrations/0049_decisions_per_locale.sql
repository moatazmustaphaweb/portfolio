-- 0049 — A DECISION BELONGS TO ONE LOCALE TOO.
--
-- The fourth and last table where a shared row forced Arabic to attach by
-- index. 0045 did `chapter_paragraphs`, 0046 `cover_paragraphs`, 0048
-- `page_sections`; this closes the set.
--
-- ── WHAT IT COSTS TODAY ─────────────────────────────────────────────────────
--
-- Measured against the database on 2026-08-23, before this migration: 20
-- decisions, 19 with Arabic. The one without is `egypt-acquisition/workflow`,
-- and its Arabic is not missing — it is refused:
--
--   English                                                    Arabic
--   ────────────────────────────────────────────────────────── ──────────────────────────────────────
--   Decision · Fold the separate systems in, and give the       القرار الأول · ضمّ الأنظمة المنفصلة إلى الداخل
--              exception a life                                 القرار الثاني · جعل الاستثناء (Exception)
--                                                                              كيانًا له دورة حياة
--                                                               القرار الثالث · إظهار مخارج القرار الخمسة
--
-- Read off both Notion pages on 2026-08-23. The English names one decision that
-- does two things; the Arabic names them separately and adds a third about the
-- five outcomes a decision can have. Both are finished. `1 !== 3`, so
-- `pairArabic` is false and all three Arabic decisions are dropped on every
-- run, with a notice.
--
-- ── THE GATE IS NOT LOOSENED. IT IS MADE UNREACHABLE ────────────────────────
--
-- Pairing by index across 1 and 3 would attach `القرار الأول` to the English
-- decision and silently discard the other two, or — on a chapter where the
-- counts happened to line up differently — attach the wrong Arabic body to the
-- wrong English name. The gate was right. What was wrong is that a decision row
-- was shared by two languages, so an index had to exist for Arabic to attach
-- at all.
--
-- Give the row a locale and each language owns its own ordered list. Nothing
-- pairs; there is no index left to guard.
--
-- ── THE FALLBACK IS PER CHAPTER ─────────────────────────────────────────────
--
-- Decision 013 unchanged, resolved one level up: a chapter with Arabic
-- decisions serves them; a chapter with none serves the English list whole,
-- marked `lang="en"` (decision 053, already carried by `withFields` because an
-- `en` row holds only an `en` translation).
--
-- Per DECISION is not available and would be wrong for the same reason 0048
-- gives: a decision has no language-independent name — the name IS the content
-- — so a chapter serving 3 Arabic decisions plus the 1 English one it "lacks"
-- would publish the same argument twice, in two languages, on one page.

/* ------------------------------------------------------------------ locale */

alter table decisions
  -- THE DEFAULT IS FOR THE BACKFILL BELOW ONLY and is dropped at the end of
  -- this file, so the sync must state a locale on every insert.
  add column locale locale_code not null default 'en';

-- `decisions` never had a uniqueness rule — only an index — because one row per
-- (chapter, position) was implicit in a writer that deletes and re-inserts the
-- whole list. Two locales now share that space, so the rule is worth stating
-- rather than assuming: it is what makes an Arabic list a SEQUENCE rather than
-- a bag, and it is the constraint 0045 and 0046 both added for the same reason.
alter table decisions
  add constraint decisions_chapter_locale_sort_key unique (chapter_id, locale, sort_order);

drop index if exists decisions_chapter_id_sort_order_idx;
create index decisions_chapter_idx on decisions (chapter_id, locale, sort_order);

/* --------------------------------------------------------------- backfill */

-- The sync rebuilds every chapter's decisions from Notion on each run and is
-- idempotent, so this is a safety net rather than the delivery mechanism. It is
-- written anyway because a migration that drops finished Arabic on the way past
-- is the same failure the migration exists to end.
--
-- Every existing row becomes the ENGLISH row (the default above). Every row
-- carrying an Arabic translation gains an Arabic twin at the same position and
-- its Arabic translations MOVE to the twin. Nothing is deleted.

-- ⚠️ `materialized` is load-bearing, not decoration — the same trap 0045, 0046
-- and 0048 document. A plain CTE may be inlined into each reference, and
-- `gen_random_uuid()` would then produce a DIFFERENT id for the insert than for
-- the update, moving the translations onto rows that do not exist.

with candidates as materialized (
  select d.id              as old_id,
         gen_random_uuid() as new_id,
         d.chapter_id,
         d.sort_order
  from decisions d
  where exists (
    select 1 from translations t
    where t.entity_type = 'decision'
      and t.entity_id = d.id
      and t.locale = 'ar')
),
twins as (
  insert into decisions (id, chapter_id, sort_order, locale)
  select new_id, chapter_id, sort_order, 'ar' from candidates
  returning id
)
update translations t
set entity_id = c.new_id
from candidates c
where t.entity_type = 'decision'
  and t.entity_id = c.old_id
  and t.locale = 'ar';

/* ------------------------------------------------- no default after this */

alter table decisions alter column locale drop default;

comment on column decisions.locale is
  'The language this decision IS, not a language it can be translated into. Each locale owns its own ordered list within a chapter; nothing pairs by position, and the English fallback resolves per CHAPTER.';
