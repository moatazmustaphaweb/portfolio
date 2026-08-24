-- 0054 — Strings for the career timeline.
--
-- ── WHY ─────────────────────────────────────────────────────────────────────
--
-- Task `043240826`, the render half of 0053. Two strings the component cannot
-- hold itself:
--
--   career_heading  the section's own heading on About.
--   career_present  what a role with a NULL `ended` shows instead of a date.
--
-- `career_present` is the one that matters structurally. "Present" is a WORD,
-- and rule 1 says no human-readable string lives in code — so the NULL in
-- `career_roles.ended` means "current" and this string is what that renders as.
-- Writing `ended ?? "Present"` in the component would have been the obvious
-- shortcut and would have shipped an untranslatable English literal onto the
-- Arabic page.
--
-- ── THE ARABIC IS NOT APPROVED YET ──────────────────────────────────────────
--
-- ⚠️ Both Arabic values are written from the English by the assistant and have
-- NOT been reviewed by Moataz. Seeded so the timeline is not half-English in
-- Arabic. Tracked in TASKS.md with the pairs from 0051 and 0052.
--
-- `المسار المهني` — "the professional path", which is what a career timeline is
-- called in Arabic CVs and product copy; `الخبرة` ("experience") was the other
-- candidate and reads more like a CV section header than a page heading.
-- `حتى الآن` — "until now", the ordinary way an open-ended role is written in
-- Arabic, rather than a literal rendering of "Present".
--
-- ⚠️ THE SHAPE OF THIS FILE IS LOAD-BEARING. It must stay in the
-- `with strings(key, context, en, ar) as (values …)` form, and the file must be
-- added to `SEED_FILES` in `scripts/check-seed-drift.ts`. Written in any other
-- shape it passes every build and every sync while the drift check reports the
-- keys as missing from any migration — see 0047, which did exactly that.

with strings(key, context, en, ar) as (values
  ('career_heading', 'Heading for the career timeline section on About.',                    'Career',  'المسار المهني'),
  ('career_present', 'Shown in place of an end date when a role is current (ended is NULL).', 'Present', 'حتى الآن')
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
