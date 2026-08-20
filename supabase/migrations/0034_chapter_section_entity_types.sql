-- 0034 — Two entity_type values for the chapter slot model.
--
-- ⚠️ THIS MIGRATION EXISTS SEPARATELY FOR A POSTGRES REASON, not a stylistic one.
--
-- `alter type ... add value` cannot be followed, in the same transaction, by a
-- statement that USES the new label. Creating the tables and writing rows that
-- reference these values must therefore happen in a later transaction — which is
-- what 0035 is. Merging the two files produces:
--
--   ERROR: unsafe use of new value "chapter_section" of enum type entity_type
--
-- The same split, for the same reason, as 0030 before 0031. Recorded again here
-- because the next person to add a slot model will reach for one file.

alter type entity_type add value if not exists 'chapter_section';
alter type entity_type add value if not exists 'chapter_paragraph';
