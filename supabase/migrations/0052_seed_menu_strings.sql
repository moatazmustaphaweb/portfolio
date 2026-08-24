-- 0052 — Accessible names for the mobile menu button.
--
-- ── WHY ─────────────────────────────────────────────────────────────────────
--
-- Task `040240826`. On mobile the four nav links collapse into a burger button.
-- The button is an icon with no visible text, so its accessible name has to
-- come from somewhere — and per rule 1 that somewhere is `ui_strings`, never a
-- literal in the component.
--
-- TWO strings, not one: the button's name changes with its state. "Open menu"
-- while closed, "Close menu" while open. A single "Menu" would leave a screen
-- reader announcing the same thing in both states, and `aria-expanded` alone
-- reads as "expanded" without saying what would collapse.
--
-- ── THE ARABIC IS NOT APPROVED YET ──────────────────────────────────────────
--
-- ⚠️ Both Arabic values are written from the English by the assistant and have
-- NOT been reviewed by Moataz. Seeded so the button is not nameless in Arabic —
-- an unnamed icon button is a worse failure than a provisional wording. Tracked
-- in TASKS.md with the other strings awaiting his review, alongside the two
-- from 0051.
--
-- `فتح القائمة` — "open the menu". `إغلاق القائمة` — "close the menu". Both are
-- the plain register the rest of the UI strings use; neither invents a term.
--
-- ⚠️ THE SHAPE OF THIS FILE IS LOAD-BEARING. It must stay in the
-- `with strings(key, context, en, ar) as (values …)` form, and the file must be
-- added to `SEED_FILES` in `scripts/check-seed-drift.ts`. Written in any other
-- shape it passes every build and every sync while the drift check reports the
-- keys as missing from any migration — see 0047, which did exactly that.

with strings(key, context, en, ar) as (values
  ('menu_open',  'aria-label on the mobile menu button while the menu is closed.', 'Open menu',  'فتح القائمة'),
  ('menu_close', 'aria-label on the mobile menu button while the menu is open.',   'Close menu', 'إغلاق القائمة')
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
