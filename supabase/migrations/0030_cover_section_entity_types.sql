-- 0030 — Two entity_type values for the cover slot model.
--
-- ⚠️ THIS MIGRATION EXISTS SEPARATELY FOR A POSTGRES REASON, not a stylistic one.
--
-- `alter type ... add value` cannot be followed, in the same transaction, by a
-- statement that USES the new label. Creating the tables and inserting rows that
-- reference these values must therefore happen in a later transaction — which is
-- what 0031 is. Merging the two files produces:
--
--   ERROR: unsafe use of new value "cover_section" of enum type entity_type
--
-- ── WHY THIS IS A MIGRATION AT ALL ──────────────────────────────────────────
--
-- `translations.field` and `page_sections.page` are plain text with no
-- constraint, which is why earlier work on this table needed no migration. It
-- was asserted from that, wrongly, that the cover model would need none either.
-- `translations.entity_type` is an ENUM — seventeen values, none of them usable
-- for a cover section — so it does.
--
-- Recorded because the same wrong inference is available to the next person
-- reading only the `field` column.

alter type entity_type add value if not exists 'cover_section';
alter type entity_type add value if not exists 'cover_paragraph';
