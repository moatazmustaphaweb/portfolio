-- 0047 — Accessible names for the site's <nav> landmarks.
--
-- ── WHY ─────────────────────────────────────────────────────────────────────
--
-- `docs/accessibility-audit.md` finding 4. A screen-reader user can list every
-- landmark on a page; the site has SEVEN <nav> elements and only the breadcrumb
-- carries a name, so the rest are announced as an undifferentiated
-- "navigation … navigation" with no way to tell the header menu from the links
-- at the foot of the page.
--
-- axe reports it as `landmark-unique`: 24 nodes on 24 pages before the footer
-- menu was withdrawn in `012230826`, 18 on 18 after.
--
-- ── WHY THREE STRINGS AND NOT SEVEN ─────────────────────────────────────────
--
-- Five of the seven are the same thing — the onward-links block at the foot of
-- About, Philosophy, Systems, the linear view and the results table. They do
-- one job and share one name. A distinct string per page would be seven
-- translations to review for no gain to the person listening, and the label is
-- heard rather than seen, so precision matters more than variety.
--
-- The chapter's prev/next block is separate because it is genuinely different:
-- it moves BETWEEN chapters rather than onward from a page.
--
-- ── THE ARABIC IS HIS ───────────────────────────────────────────────────────
--
-- Approved by Moataz 2026-08-23, not rendered from the English by me. The
-- strings that go the other way are tracked in TASKS.md, and the distinction
-- is the point of tracking them.
--
-- ⚠️ THE SHAPE OF THIS FILE IS LOAD-BEARING. It must stay in the
-- `with strings(key, context, en, ar) as (values …)` form, and the file must
-- stay listed in `SEED_FILES` in `scripts/check-seed-drift.ts`. Written first
-- in the shape of 0023 — which the drift parser does not read — this file
-- passed a live sync and a production build while `check:seed-drift` reported
-- all three keys as "in the database but NOT in any migration file". The guard
-- caught it; the build did not, and could not.

with strings(key, context, en, ar) as (values
  ('nav_main',    'aria-label on the header menu. Announced to screen readers, never shown.',        'Main navigation',    'التنقل الرئيسي'),
  ('nav_onward',  'aria-label on the onward-links block at the foot of a page. Shared by five.',     'Continue',           'تابع القراءة'),
  ('nav_chapter', 'aria-label on the previous/next block inside a chapter.',                          'Chapter navigation', 'التنقل بين الفصول')
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
