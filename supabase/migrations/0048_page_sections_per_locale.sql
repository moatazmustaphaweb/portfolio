-- 0048 — THE THIRD APPLICATION OF 0045's RULE: A PAGE SECTION BELONGS TO ONE LOCALE.
--
-- 0045 put `locale` on `chapter_paragraphs`. 0046 put it on `cover_paragraphs`.
-- This is the last table where the count gate is still discarding Arabic that
-- Moataz has written.
--
-- ── WHAT IT COSTS TODAY ─────────────────────────────────────────────────────
--
-- Measured against the database on 2026-08-23, before this migration:
--
--   page                                    en fields   ar fields
--   about                                        13         13
--   about/philosophy                             10         10
--   contact                                       9          9
--   systems                                       9          9
--   work/egypt-acquisition/accessibility         27          0
--
-- The Arabic accessibility page exists and is finished. It offers 8 sections to
-- the English page's 14, so `sections.length !== parsedAr.sections.length` and
-- the sync skips **all** of it with a notice. 27 fields render English on a
-- published Arabic page.
--
-- ── THE COUNTS DIFFER BECAUSE THE TWO PAGES ARE SPLIT DIFFERENTLY ───────────
--
-- Read block by block off both Notion pages on 2026-08-23, not inferred:
--
--   English                                    Arabic
--   ─────────────────────────────────────────  ─────────────────────────────────
--   (lede)                                     H1 قابلية الوصول والاستخدام …
--   H2 The position                            H2 الموقف
--   H2 Why this became the argument that won   H2 لماذا كسبت هذه الحجة دون غيرها
--   H2 What shipped            ┐               H2 ما صدر عن هذا القرار
--     H3 1 · Bilingual parity  │                  ¶ ١ · التكافؤ بين اللغتين …
--     H3 2 · Language switching│  six H3         ¶ ٢ · تبديل اللغة …
--     H3 3 · Plain language    ├─ subsections    ¶ ٣ · لغة مفهومة …
--     H3 4 · Error prevention  │  in English     ¶ ٤ · منع الخطأ مقدمًا …
--     H3 5 · Confirming        │  are six        ¶ ٥ · التأكيد بدل الكتابة …
--     H3 6 · Cognitive load    ┘  PARAGRAPHS     ¶ ٦ · الحمل الذهني …
--   H2 The design system contribution      ┐   (folded into مكتبة المكونات)
--   H2 Conformance — what was designed …   │    H2 سجل المطابقة — ما صُمم …
--   (its table)                            │    (its table)
--   H2 The component library, named …      ┘    H2 مكتبة المكونات، باسمها الصحيح
--   H2 Why this matters beyond compliance       H2 لماذا يهم هذا بما يتجاوز الامتثال
--
-- **Nothing is missing from the Arabic.** Every English passage has an Arabic
-- counterpart; the Arabic writes six headed subsections as six numbered
-- paragraphs and folds the design-system passage into the component-library
-- section. That is the same thing 0045 and 0046 found one level down — the
-- Arabic splits where the English joins — and it is not an error to correct.
--
-- ── WHY THE FALLBACK IS PER PAGE, AND CANNOT BE PER SECTION ─────────────────
--
-- 0046 moved decision 013's fallback from the paragraph to the SLOT, because a
-- cover slot has a language-independent name (`thesis`) that both locales
-- resolve to through `cover_slot_aliases`. A page section has no such name: its
-- identity IS its heading, and the heading is prose.
--
-- Per-section fallback was tried on paper against the table above and is
-- actively wrong here. An Arabic page holding 7 sections against English's 14
-- would fall back for the 7 it "lacks" — and the Arabic reader would get the
-- six numbered items twice, once in Arabic inside `ما صدر عن هذا القرار` and
-- again as six English sections beneath it, plus the design-system passage
-- twice. Duplicated content, not a gap filled.
--
-- **So the unit of the fallback is the page.** `getPageSections` serves the
-- requested locale's sequence when the page has one, and the English sequence
-- whole when it does not — marked `lang="en"` per decision 053, which needs no
-- new code: an `en` row carries only an `en` translation, so
-- `withFields` reports `fieldLocales.body === 'en'` on its own.
--
-- This is the same strengthening 0045 and 0046 made, one level up: the old
-- shape could render a page half Arabic and half English, section by section,
-- whichever happened to carry a translation. It now renders one language or
-- the other.
--
-- ── THE GATE IS NOT LOOSENED. IT IS MADE UNREACHABLE ────────────────────────
--
-- Pairing 8 Arabic sections against 14 English ones by array index would put
-- `سجل المطابقة` (Conformance) under the heading `4 · Error prevention` and its
-- table under `5 · Confirming instead of typing`. The gate was right to refuse.
-- What was wrong is the model that made an index exist. Nothing pairs now, so
-- there is nothing left to guard.

/* ------------------------------------------------------------------ locale */

alter table page_sections
  -- THE DEFAULT IS FOR THE BACKFILL BELOW ONLY and is dropped at the end of
  -- this file, so the sync must state a locale on every insert. A default
  -- locale is the quiet guess that makes a missing translation and a dropped
  -- one indistinguishable — the same call 0045 and 0046 made.
  add column locale locale_code not null default 'en';

-- Two locales now occupy one page, and each owns its own slug namespace: an
-- Arabic heading slugs to Arabic, so a collision across locales is impossible
-- in practice — but `page_section_slug_aliases` (0050) deliberately gives some
-- Arabic sections the ENGLISH slug so a cross-locale binding survives, and
-- then (page, slug) alone would collide. The locale is part of the key.
alter table page_sections drop constraint page_sections_unique;

alter table page_sections
  add constraint page_sections_page_locale_slug_key unique (page, locale, slug);

drop index if exists page_sections_page_idx;
create index page_sections_page_idx on page_sections (page, locale, sort_order);

/* --------------------------------------------------------------- backfill */

-- The sync rebuilds every page from Notion on each run and is idempotent, so
-- this is a safety net rather than the delivery mechanism. It is written anyway
-- because a migration that drops finished Arabic on the way past is the same
-- failure the migration exists to end.
--
-- Every existing row becomes the ENGLISH row (the default above). Every row
-- carrying an Arabic translation gains an Arabic twin at the same position and
-- its Arabic translations MOVE to the twin. Nothing is deleted.
--
-- The twin keeps the ENGLISH slug. The real Arabic slug is derived from the
-- Arabic heading by `headingToSlug`, which is TypeScript and not available
-- here; the next sync overwrites the row with it. The consequence of the
-- approximation until then is an anchor id in the wrong language on four
-- pages — visible in the address bar, invisible on the page.

-- ⚠️ `materialized` is load-bearing, not decoration — the same trap 0045 and
-- 0046 document. A plain CTE may be inlined into each reference, and
-- `gen_random_uuid()` would then produce a DIFFERENT id for the insert than for
-- the update, moving the translations onto rows that do not exist.

with candidates as materialized (
  select ps.id             as old_id,
         gen_random_uuid() as new_id,
         ps.page,
         ps.slug,
         ps.sort_order,
         ps.kind
  from page_sections ps
  where exists (
    select 1 from translations t
    where t.entity_type = 'page_section'
      and t.entity_id = ps.id
      and t.locale = 'ar')
),
twins as (
  insert into page_sections (id, page, slug, sort_order, kind, locale)
  select new_id, page, slug, sort_order, kind, 'ar' from candidates
  returning id
)
update translations t
set entity_id = c.new_id
from candidates c
where t.entity_type = 'page_section'
  and t.entity_id = c.old_id
  and t.locale = 'ar';

/* ------------------------------------------------- no default after this */

alter table page_sections alter column locale drop default;

comment on column page_sections.locale is
  'The language this section IS, not a language it can be translated into. Each locale owns its own ordered sequence of sections within a page; nothing pairs by position, and the English fallback resolves per PAGE because a section has no language-independent name.';
