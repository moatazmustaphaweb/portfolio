-- 0063 — `chapters.image_layout`: how CONSECUTIVE figures in a chapter render
--         (task 004221026)
--
-- Decided by Moataz: authored per chapter, as the Notion property
-- `Image layout` on the chapter page (`Stacked` | `Grid`, empty = Stacked).
-- The sync writes it on every chapter upsert; `lib/content` exposes it as
-- `imageLayout`. The vocabulary lives in `lib/media/image-layout.ts`.
--
-- `text` + CHECK rather than an enum, following `chapters.device_frame` (0062)
-- and `case_files.cover_kind` (0026): a third layout is then one constraint
-- change, not an `alter type … add value` that has to run in its own
-- transaction.
--
-- NO BACKFILL. Every existing row takes the default, `stacked`, which is what
-- an empty `Image layout` means by decision — and is how every chapter renders
-- today. `grid` arrives through the sync, from Notion, and nowhere else.
--
-- Idempotent: re-running it is a no-op.
--
-- ⚠️ ORDER: apply this BEFORE the next live `npm run sync:notion`. The sync
-- checks for the column at start-up and refuses to write without it.

alter table chapters
  add column if not exists image_layout text not null default 'stacked';

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'chapters_image_layout_valid'
       and conrelid = 'public.chapters'::regclass
  ) then
    alter table chapters
      add constraint chapters_image_layout_valid
        check (image_layout in ('stacked', 'grid'));
  end if;
end $$;

comment on column chapters.image_layout is
  'How consecutive figures in this chapter render: stacked | grid. From the Notion property Image layout; empty = stacked.';
