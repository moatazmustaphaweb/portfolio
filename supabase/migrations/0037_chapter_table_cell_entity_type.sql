-- 0037 — One entity_type value for table cells.
--
-- ⚠️ SEPARATE FOR THE POSTGRES REASON 0030 AND 0034 BOTH DOCUMENT:
-- `alter type ... add value` cannot be followed, in the same transaction, by a
-- statement that USES the new label. 0038 creates the table that references it.

alter type entity_type add value if not exists 'chapter_table_cell';
