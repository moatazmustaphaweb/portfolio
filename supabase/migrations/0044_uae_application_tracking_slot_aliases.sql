-- 0044 — Three headings from the UAE Application Tracking chapter join the slot model.
--
-- The chapter was authored in Notion on 2026-08-22 (task `001220826`) and its
-- first sync failed on three headings, exactly as 0035 and 0036 intended:
-- named, refused, nothing written silently. This is that refusal answered.
--
-- ── WHY THESE ARE ALIASES AND NOT CORRECTED HEADINGS ────────────────────────
--
-- The sync's own message offers both fixes: add a row here, or change the
-- heading in Notion. Changing the headings would undo two rulings Moataz made
-- the same day, so the rows are the correct half of that choice.
--
-- 1. `what the mobile app changes` → `what-mobile-changes`
--
--    Egypt's comparison page says "What mobile changes" and that is already
--    aliased. This chapter says "What the mobile **app** changes" because he
--    ruled that `phone` is not the word and that `mobile app` is better than
--    bare `mobile` wherever either would read. Renaming the heading to match
--    Egypt's would reverse that ruling to satisfy a lookup table, which is the
--    wrong way round: the slot is the structural name, the heading is the prose,
--    and this table exists precisely so the prose does not have to bend.
--
-- 2. `ما لا يتغيّر` → `what-never-changes`
-- 3. `ما يغيّره التطبيق` → `what-mobile-changes`
--
--    Egypt's Arabic reads `ما لا يتغير بين المنصتين` and `ما يغيره الموبايل`.
--    This page's Arabic is shorter and says `التطبيق`, and it is his own text —
--    he rewrote this page himself. It is also the rule now recorded in the
--    `portfolio-voice` skill: the two languages are allowed to say different
--    things, and Arabic carries in context what English has to state. Two
--    Arabic headings mapping to one slot across two chapters is the same shape
--    as `the-fight-i-lost` in 0036, and safe for the same reason —
--    `unique (chapter_id, slot)` forbids a collision on one chapter, and no
--    chapter carries both.
--
-- ── ON THE SHADDA ───────────────────────────────────────────────────────────
--
-- `heading_norm` keeps the shadda: `يتغيّر` here against `يتغير` in 0036's row.
-- Normalisation lowercases and trims; it does not strip Arabic diacritics. So
-- these are genuinely distinct keys and neither row shadows the other. Do not
-- "tidy" one to match the other — that silently unmaps a live heading.

insert into chapter_slot_aliases (heading_norm, slot, observed_on) values
  ('what the mobile app changes', 'what-mobile-changes',  'uae-acquisition/application-tracking'),
  ('ما لا يتغيّر',                 'what-never-changes',   'uae-acquisition/application-tracking'),
  ('ما يغيّره التطبيق',            'what-mobile-changes',  'uae-acquisition/application-tracking')
on conflict (heading_norm) do nothing;
