-- 0066 — `chapters.image_layout` gains a third value, `editorial`
--         (task 012261026, decision 068)
--
-- Decided by Moataz: an editorial chapter pairs each figure with the prose
-- that leads into it, beside it for a narrow figure and alternating sides,
-- full width for a wide one. Authored per chapter as the Notion property
-- `Image layout` = `Editorial`, exactly as `Stacked` and `Grid` are (0063).
-- The vocabulary lives in `lib/media/image-layout.ts`; the Notion option is
-- read in `lib/sync/image-layout.ts`.
--
-- This is the "one constraint change" 0063 chose `text` + CHECK for: the
-- CHECK is dropped and recreated with the wider set. No column change, no
-- type change.
--
-- NO BACKFILL. Every existing row is `stacked` or `grid` and stays so;
-- `editorial` arrives through the sync, from Notion, and nowhere else.
--
-- Idempotent: re-running it drops and recreates the same constraint.
--
-- ⚠️ ORDER: apply this BEFORE a live `npm run sync:notion` writes `editorial`.
-- The sync's start-up check only proves the column exists (0063); it cannot
-- see which values the CHECK allows. Without 0066, the upsert of any chapter
-- whose `Image layout` is Editorial is refused by `chapters_image_layout_valid`
-- and that chapter is reported as a failure — loudly, but not written.
-- Chapters set to Stacked, Grid or empty sync as before.

alter table chapters
  drop constraint if exists chapters_image_layout_valid;

alter table chapters
  add constraint chapters_image_layout_valid
    check (image_layout in ('stacked', 'grid', 'editorial'));

comment on column chapters.image_layout is
  'How the figures in this chapter render: stacked | grid | editorial (decision 068). From the Notion property Image layout; empty = stacked.';
