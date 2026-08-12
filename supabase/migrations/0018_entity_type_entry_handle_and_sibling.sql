-- 0018 — `entity_type` gains `entry_handle` and `case_file_sibling`.
--
-- `translations` is polymorphic and keyed on (entity_type, entity_id, field,
-- locale), so a new table with translatable copy needs its own enum value
-- before a single string can be written for it. Same step decision 032 took
-- for `decision`.
--
-- Separate from 0017 on purpose: Postgres will not let a newly added enum
-- value be USED in the same transaction that adds it, so creating the tables
-- and extending the enum have to be different migrations.
--
-- Fields written against these types:
--   entry_handle       → `invitation`, `payoff`
--   case_file_sibling  → `note`

alter type entity_type add value if not exists 'entry_handle';
alter type entity_type add value if not exists 'case_file_sibling';
