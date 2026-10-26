-- 0065 — Quotes shown under the loader during a long navigation wait, and the
-- two directional glyph keys (`arrow_forward`, `arrow_back`).
--
-- ── WHY ─────────────────────────────────────────────────────────────────────
--
-- Task `013251026`, decision 063 item 4. When a navigation is still pending
-- after 2.5s, one sentence is shown under the loader. Per rule 1 the sentences
-- live in `ui_strings`, never in the component.
--
-- ── WHERE THE WORDS COME FROM ───────────────────────────────────────────────
--
-- Every sentence, in both languages, is Moataz's own, taken verbatim from his
-- published pages and supplied in the brief. None was written or edited here.
-- No numbers (motion-system §13).
--
-- ── THE TWO GLYPH KEYS ──────────────────────────────────────────────────────
--
-- Task `007261026`. `arrow_forward` and `arrow_back` carry the directional
-- glyphs for "go forward / open" and "go back" affordances. Under rtl-guard a
-- directional glyph is content: never a literal in JSX, never flipped with CSS.
-- Each locale stores the glyph that points the right way in its own reading
-- direction, so EN → / ← and AR ← / →. No migration before this one seeds a key
-- for either purpose (grep of supabase/migrations for arrow, glyph, →, ←).
--
-- ⚠️ THE SHAPE OF THIS FILE IS LOAD-BEARING. It must stay in the
-- `with strings(key, context, en, ar) as (values …)` form, and the file must be
-- listed in `SEED_FILES` in `scripts/check-seed-drift.ts` (it is). See 0052.

with strings(key, context, en, ar) as (values
  ('wait_quote_1', 'Shown under the loader during a long navigation wait (decision 063). Verbatim from Moataz''s published pages.', 'Designing a building is not drawing a building.', 'تصميم مبنى ليس رسم مبنى.'),
  ('wait_quote_2', 'Shown under the loader during a long navigation wait (decision 063). Verbatim from Moataz''s published pages.', 'It is better to be right than to be consistent.', 'أن تكون مُحقّاً خير من أن تكون متسقاً.'),
  ('wait_quote_3', 'Shown under the loader during a long navigation wait (decision 063). Verbatim from Moataz''s published pages.', 'When a digital journey removes a human, it inherits their job.', 'حين تزيل رحلة رقمية إنساناً، فإنها ترث عمله.'),
  ('wait_quote_4', 'Shown under the loader during a long navigation wait (decision 063). Verbatim from Moataz''s published pages.', 'I trust behaviour over statements.', 'أثق بالسلوك قبل الأقوال.'),
  ('wait_quote_5', 'Shown under the loader during a long navigation wait (decision 063). Verbatim from Moataz''s published pages.', 'Art is a language, not a school subject.', 'الفن لغة، لا مادة دراسية.'),
  ('wait_quote_6', 'Shown under the loader during a long navigation wait (decision 063). Verbatim from Moataz''s published pages.', 'Structure serves whoever is doing the work.', 'البنية تخدم من يؤدي العمل.'),
  ('wait_quote_7', 'Shown under the loader during a long navigation wait (decision 063). Verbatim from Moataz''s published pages.', 'What began as a language decision turned out to be an architectural one.', 'ما بدأ كقرار لغوي اتضح أنه قرار معماري.'),
  ('arrow_forward', 'Directional glyph for "go forward / open" affordances (chapter cards, CTAs). rtl-guard: never a literal in JSX, never flipped with CSS.', '→', '←'),
  ('arrow_back', 'Directional glyph for "go back" affordances. rtl-guard.', '←', '→')
), upsert_keys as (
  insert into ui_strings (key, context)
  select key, context from strings
  on conflict (key) do update set context = excluded.context
  returning id, key
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'ui_string', k.id, l.locale::locale_code, 'label', l.value
from strings s
join upsert_keys k on k.key = s.key
cross join lateral (values ('en', s.en), ('ar', s.ar)) as l(locale, value)
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value, updated_at = now();
