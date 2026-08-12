-- 0025 — `page_sections.kind`: prose or table.
--
-- The comparison pages are not prose with a table attached; the table IS the
-- page. "The differences, decision by decision" is a five-column argument, and
-- flattening it into paragraphs would destroy the one thing it exists to do —
-- let you read one decision across two platforms on a single line.
--
-- A table section stores its grid in `body`: cells separated by TAB, rows by
-- NEWLINE. Deliberately not JSON. The body column is already a translated
-- text field, the Arabic version of a table is the same grid with the same
-- shape, and a JSON blob inside a translation is a thing no reviewer can read
-- when checking the Arabic.
--
-- The first row is treated as the header by the renderer.

alter table page_sections
  add column kind text not null default 'prose'
  check (kind in ('prose', 'table'));
