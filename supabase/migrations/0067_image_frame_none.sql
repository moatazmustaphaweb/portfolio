-- 0067 — `chapter_paragraphs.frame`: a figure that opts out of its device frame
--         (task 013261026, decision 069)
--
-- Decided by Moataz: the device frame stays automatic by aspect ratio, but a
-- finished mockup is already composed and must render bare. Nothing on the
-- chapter or the picture can tell a mockup from a raw screen, so it is authored
-- PER IMAGE, as an optional fourth span in the Notion image tag:
--
--   `[cld] …`  `[alt] …`  `[caption] …`  `[frame] none`
--
-- WHY ON `chapter_paragraphs` AND NOT ON `media`. A `chapter_paragraphs` row
-- whose body is `[image:<uuid>]` IS the placement of that image: one row per
-- figure, per locale, per position. `media` rows are keyed on the Cloudinary
-- public ID and shared across locales and chapters, so a flag there would
-- unframe the same asset everywhere it appears.
--
-- Nullable `text` + CHECK, the same shape as `chapters.device_frame` (0062) and
-- `chapters.image_layout` (0063). NULL = automatic frame (the default and the
-- state of every existing row); 'none' = render unframed. There is no other
-- value: the sync reports any other `[frame]` value and writes NULL.
--
-- NO BACKFILL. Every existing row is NULL, which is what an absent `[frame]`
-- means. 'none' arrives through the sync, from Notion, and nowhere else.
--
-- Idempotent: re-running it is a no-op.
--
-- ORDER: either order is safe. Before this is applied, a live sync writes
-- everything else, skips the flag, and reports each `[frame] none` it could not
-- store; `lib/content/chapters.ts` reads a missing column as NULL. After it is
-- applied, the next live sync stores the flags.

alter table chapter_paragraphs
  add column if not exists frame text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'chapter_paragraphs_frame_valid'
       and conrelid = 'public.chapter_paragraphs'::regclass
  ) then
    alter table chapter_paragraphs
      add constraint chapter_paragraphs_frame_valid
        check (frame is null or frame = 'none');
  end if;
end $$;

comment on column chapter_paragraphs.frame is
  'Per-placement frame override for an image paragraph: NULL = automatic device frame by aspect ratio; none = render unframed (decision 069). From the Notion image tag span [frame] none.';
