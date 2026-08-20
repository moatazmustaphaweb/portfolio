-- 0038 — A chapter paragraph can be a TABLE.
--
-- ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
--
-- The three document pages — the accessibility page and the two comparisons —
-- could not join the slot model without this. Each carries exactly one table,
-- and `chapter_paragraphs` could only hold text or an `[image:uuid]` marker, so
-- migrating them would have dropped the table SILENTLY. `docs/sync-contract.md`
-- warns about precisely that: "On the comparison pages the table is the page —
-- 'The differences, decision by decision' is a grid, and dropping it would have
-- synced two pages of preamble around a hole."
--
-- The cost of not having it was concrete: the accessibility page carries 18
-- image tags per locale — 36, the largest image payload on the site — and none
-- of them could be delivered.
--
-- ── THE SHAPE ───────────────────────────────────────────────────────────────
--
-- `chapter_paragraphs.kind` says what a row is. A `prose` row keeps its text in
-- translations exactly as before; a `table` row has no body and owns cells.
--
-- Cells are ROWS, not a serialised blob in a text field. That is the same
-- decision `chapter_paragraphs` itself embodies, for the same two reasons:
--   1. Each cell translates independently, so `translations` stays the single
--      home of every human-readable string (rule 1).
--   2. Decision 053 needs to know the LANGUAGE of each rendered string. A blob
--      can only carry one answer for the whole grid.
--
-- ── HOW IT RENDERS, AND WHY IT CANNOT DRIFT ─────────────────────────────────
--
-- The cells are reassembled into the SAME tab-separated / newline-separated
-- string `page_sections` has always produced, and handed to the SAME
-- `SectionTable` component that renders it today. The markup is therefore
-- identical by construction rather than by inspection — there is no second
-- table renderer to drift from the first.

/* ------------------------------------------------------------ paragraph kind */

alter table chapter_paragraphs
  add column kind text not null default 'prose';

-- TEXT with a CHECK rather than an enum: the set is small and closed, and an
-- enum here would mean a migration to add a third kind. `slot` made the same
-- call for the same reason.
alter table chapter_paragraphs
  add constraint chapter_paragraphs_kind_check
  check (kind in ('prose', 'table'));

/* -------------------------------------------------------------------- cells */

create table chapter_table_cells (
  id                   uuid primary key default gen_random_uuid(),
  chapter_paragraph_id uuid not null references chapter_paragraphs(id) on delete cascade,
  row_idx              integer not null,
  col_idx              integer not null,
  /*
   * Row 0 is the header row on every table this site has, but the flag is
   * stored rather than assumed: `SectionTable` also renders column 0 of each
   * body row as a `<th scope="row">`, and a table that ever arrives without a
   * header row would otherwise silently promote its first data row.
   */
  is_header            boolean not null default false,
  unique (chapter_paragraph_id, row_idx, col_idx)
);

create index chapter_table_cells_paragraph_idx
  on chapter_table_cells (chapter_paragraph_id, row_idx, col_idx);

alter table chapter_table_cells enable row level security;
