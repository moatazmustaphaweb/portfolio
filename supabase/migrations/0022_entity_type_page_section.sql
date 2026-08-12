-- 0022 — `entity_type` gains `page_section`.
--
-- Separate from 0021 because Postgres will not let a newly added enum value be
-- USED in the transaction that adds it. Same split as 0017/0018.
--
-- Fields written against this type: `heading`, `body`.

alter type entity_type add value if not exists 'page_section';
