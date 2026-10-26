-- 0062 — `chapters.device_frame`: which phone a chapter's screenshots are framed in
--         (task 003221026)
--
-- Decided by Moataz: the frame is AUTHORED per chapter, as the Notion property
-- `Device` on the chapter page (`iPhone` | `Android`, empty = iPhone). It is
-- not inferred from the picture, the route, or the Cloudinary folder. The sync
-- writes it on every chapter upsert; `lib/content` exposes it as
-- `deviceFrame`. The vocabulary lives in `lib/media/device-frame.ts`.
--
-- `text` + CHECK rather than an enum, following `case_files.cover_kind` (0026)
-- and `page_sections.kind` (0025): a third device is then one constraint
-- change, not an `alter type … add value` that has to run in its own
-- transaction.
--
-- NO BACKFILL. Every existing row takes the default, `iphone`, which is what
-- an empty `Device` means by decision. Android arrives through the sync, from
-- Notion, and nowhere else.
--
-- Idempotent: re-running it is a no-op.
--
-- ⚠️ ORDER: apply this BEFORE the next live `npm run sync:notion`. The sync
-- checks for the column at start-up and refuses to write without it.

alter table chapters
  add column if not exists device_frame text not null default 'iphone';

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'chapters_device_frame_valid'
       and conrelid = 'public.chapters'::regclass
  ) then
    alter table chapters
      add constraint chapters_device_frame_valid
        check (device_frame in ('iphone', 'android'));
  end if;
end $$;

comment on column chapters.device_frame is
  'Phone frame for this chapter''s portrait screenshots: iphone | android. From the Notion property Device; empty = iphone.';
