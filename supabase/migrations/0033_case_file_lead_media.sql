-- 0033 — `lead_media_id`: the image beside a cover's leading run of sections.
--
-- ── WHAT THIS IS, AND WHAT IT IS NOT ────────────────────────────────────────
--
-- The two-column cover container reserves a third of its width for an image
-- that sits beside the leading run — the opening passage and the role card,
-- the pair `splitCoverSections` groups. This column holds THAT image.
--
-- It is NOT the cover image. `cover_media_id` is untouched, and so is
-- everything that renders from it: Egypt's inline SVG component and UAE's
-- Cloudinary artwork both stay exactly where they are, full width above the
-- title. One case file may carry both, and they are different pictures doing
-- different jobs.
--
-- Nullable because no lead image exists yet for any case file. Nothing renders
-- from this column today — the container stays dormant and the text keeps full
-- width. This migration is the slot only.
--
-- ── ALT TEXT ────────────────────────────────────────────────────────────────
--
-- Nothing new. Alt text belongs to the `media` row, as a `translations` row
-- keyed (entity_type='media', entity_id, locale, field='alt') — the same path
-- migration 0028 uses for the UAE cover. Note that `CloudinaryImage` OMITS an
-- image entirely when its alt is undefined, so the alt is not optional in
-- practice: a lead image with no alt row renders nothing at all rather than an
-- unlabelled picture.

alter table case_files
  add column lead_media_id uuid references media(id) on delete set null;

comment on column case_files.lead_media_id is
  'Image beside the cover''s leading run of sections. NOT the cover image — see cover_media_id, which is unrelated and unchanged.';

/* ------------------------------------------------- redaction, both directions */

-- ⚠️ THE TRIGGERS IN 0007 DO NOT COVER A NEW COLUMN, IN EITHER DIRECTION.
--
-- This was checked rather than assumed, and both halves needed extending:
--
--   * `assert_cover_not_redacted` fired `before insert or update OF
--     cover_media_id`. A trigger with a column list does not fire for a write
--     that touches only another column — so attaching a redacted asset to
--     `lead_media_id` would not have been examined at all.
--   * `assert_redacted_not_in_use` tested only `c.cover_media_id = new.id`, so
--     the guard was bypassable by attaching a clean asset and marking it
--     redacted afterwards. That is exactly the hole 0007 added the reverse
--     direction to close, reopened by a new column.
--
-- ── WHY PROTECT THIS COLUMN WHEN chapters.hero_media_id IS NOT PROTECTED ────
--
-- State this plainly, because the asymmetry is deliberate and would otherwise
-- read as an oversight:
--
--   `chapters.hero_media_id` has NO redaction trigger, by design. A redacted
--   asset may legitimately appear inside a chapter — that is what the redaction
--   treatment is FOR. What decision 028 forbids is a redacted asset in the two
--   places that travel: a case-file cover and the OG image.
--
-- The lead image is protected with the cover rather than with the chapter hero
-- because it sits on the case file's own cover page — the most-shared URL of
-- the four — and rule 6 is the hardest constraint in this project. Two lines of
-- SQL against an NDA asset reaching a shared page is cheap insurance.
--
-- A note on decision 028's stated reason: it says covers "are shared into link
-- previews outside our control". That is not literally true of the code today —
-- `lib/seo/metadata.ts` builds og:image from `settings.og_image` alone, and the
-- cover feeds no preview. The protection is kept anyway; the reasoning is the
-- exposure of the page, not the preview.

create or replace function assert_cover_not_redacted()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  if new.cover_media_id is not null
     and exists (select 1 from media m
                 where m.id = new.cover_media_id and m.redacted) then
    raise exception
      'case_files.cover_media_id references a redacted asset (%). Covers are '
      'shared into link previews outside our control and must use non-NDA '
      'imagery only — see decision 028.', new.cover_media_id;
  end if;

  if new.lead_media_id is not null
     and exists (select 1 from media m
                 where m.id = new.lead_media_id and m.redacted) then
    raise exception
      'case_files.lead_media_id references a redacted asset (%). The lead image '
      'renders on the case file cover page and must use non-NDA imagery only — '
      'see decision 028 and rule 6.', new.lead_media_id;
  end if;

  return new;
end;
$$;

-- Recreated because the COLUMN LIST changes. `create or replace function` alone
-- would leave the trigger still listening to `cover_media_id` only, and the new
-- branch above would never run for a lead-image write — a guard that exists in
-- the function and is unreachable from the table.
drop trigger if exists case_files_cover_not_redacted on case_files;
create trigger case_files_cover_not_redacted
  before insert or update of cover_media_id, lead_media_id on case_files
  for each row execute function assert_cover_not_redacted();

create or replace function assert_redacted_not_in_use()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  if new.redacted and not coalesce(old.redacted, false) then
    if exists (select 1 from case_files c where c.cover_media_id = new.id) then
      raise exception
        'media % cannot be marked redacted: it is in use as a case_files '
        'cover. Replace the cover first — see decision 028.', new.id;
    end if;
    if exists (select 1 from case_files c where c.lead_media_id = new.id) then
      raise exception
        'media % cannot be marked redacted: it is in use as a case_files '
        'lead image. Replace the lead image first — see decision 028.', new.id;
    end if;
    if exists (select 1 from settings s
               where s.key = 'og_image' and s.value = new.cloudinary_public_id) then
      raise exception
        'media % cannot be marked redacted: it is in use as settings.og_image. '
        'Replace the OG image first — see decision 028.', new.id;
    end if;
  end if;
  return new;
end;
$$;

-- This trigger's column list is unchanged (`update of redacted`), so it is not
-- recreated — only the function it calls.
