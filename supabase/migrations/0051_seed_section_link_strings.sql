-- 0051 — Strings for the per-section copy-link control.
--
-- ── WHY ─────────────────────────────────────────────────────────────────────
--
-- Task `039240826`. Every section heading gains a small link button that copies
-- an absolute URL to that section, so a specific passage can be sent to someone
-- rather than described. Two strings: the button's accessible name, and the
-- confirmation shown after a successful copy.
--
-- Both are read through `ui_strings`, like every other control label on the
-- site. Rule 1: no human-readable string lives in a component.
--
-- ── THE ARABIC IS NOT APPROVED YET ──────────────────────────────────────────
--
-- ⚠️ These two Arabic values are written from the English by the assistant and
-- have NOT been reviewed by Moataz. They are seeded so the control is not
-- broken in Arabic — an untranslated key renders nothing, and a button with no
-- accessible name is worse than a provisional one. They are tracked in
-- TASKS.md alongside the other strings awaiting his review, and this comment is
-- the marker to find them by.
--
-- `نسخ رابط القسم` — "copy the section's link". `تم نسخ الرابط` — "the link has
-- been copied". Both are the plain register used elsewhere in the UI strings;
-- neither invents a term.
--
-- ⚠️ THE SHAPE OF THIS FILE IS LOAD-BEARING. It must stay in the
-- `with strings(key, context, en, ar) as (values …)` form, and the file must be
-- added to `SEED_FILES` in `scripts/check-seed-drift.ts`. Written in any other
-- shape it passes every build and every sync while the drift check reports the
-- keys as missing from any migration — see 0047, which did exactly that.

with strings(key, context, en, ar) as (values
  ('copy_section_link',  'aria-label on the link button beside a section heading.',  'Copy link to this section', 'نسخ رابط القسم'),
  ('section_link_copied', 'Toast shown after the section link is copied.',           'Paragraph link copied',     'تم نسخ رابط الفقرة')
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
