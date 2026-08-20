-- 0039 — The Egypt cover's lead image: the third column beside the thesis.
--
-- Migration 0033 added `lead_media_id`, its foreign key and both redaction
-- triggers, and said plainly: "Nothing renders from this column today — the
-- container stays dormant and the text keeps full width. This migration is the
-- slot only." This is the content that fills it.
--
-- ── THE ASSET ───────────────────────────────────────────────────────────────
--
-- `EIDVSNID_9jby0x9jby0x9jby` — a photograph of an Egyptian national ID card
-- and an Emirates ID card, overlapping, shot on a pale surface.
--
-- ⚠️ The public ID is NOT a descriptive path, unlike every other asset on this
-- site. It is Cloudinary's auto-generated name from an upload that did not set
-- one. Verified to resolve before this row was written:
--
--   HTTP/2 200 · content-type: image/jpeg
--   fl_getinfo → {"input":{"width":848,"height":1264,"bytes":774570}}
--
-- The dimensions below are read from that response, not guessed.
-- `CloudinaryImage` derives the rendered box from them, so a wrong pair here
-- reserves the wrong space and the column shifts as the image loads.
--
-- ── redacted = false ────────────────────────────────────────────────────────
--
-- This is a comparison of two national identity cards — public artefacts of
-- two states, not a product screen and not a design file. There is no NDA
-- surface in it. `redacted = false` is also what keeps `CloudinaryImage` from
-- forcing the non-cropping `redacted` preset (decision 028).
--
-- Egypt still carries `nda = true`, so `e_grayscale` DOES apply to this image
-- at render — the treatment rides on the case file, not on the row (amendment
-- 036). That is deliberate and its cost is recorded in docs/status.md: in grey
-- the two cards lose the cream-against-teal contrast that makes the comparison
-- read at a glance, and the caption carries the meaning instead.
--
-- ── ALT AND CAPTION ─────────────────────────────────────────────────────────
--
-- English only, as supplied. Decision 013 falls back to English on /ar. Note
-- that `CloudinaryImage` OMITS an image whose alt is undefined, so the alt row
-- below is not decoration — without it the column renders nothing at all.

/* ------------------------------------------------------------------- media */

insert into media (cloudinary_public_id, width, height, format, redacted)
values ('EIDVSNID_9jby0x9jby0x9jby', 848, 1264, 'jpg', false)
on conflict (cloudinary_public_id) do update
  set width  = excluded.width,
      height = excluded.height,
      format = excluded.format;

/* ------------------------------------------------------- alt and caption */

-- Keyed on the media row looked up by public_id rather than a literal UUID:
-- the id is generated, and a migration that hardcodes one cannot be replayed
-- into a fresh database.
insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, 'en', 'alt', 'National ID versus Emirates ID'
from media m where m.cloudinary_public_id = 'EIDVSNID_9jby0x9jby0x9jby'
on conflict (entity_type, entity_id, locale, field)
  do update set value = excluded.value, updated_at = now();

insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, 'en', 'caption',
       'The difference of the Egyptian national ID and Emirates ID.'
from media m where m.cloudinary_public_id = 'EIDVSNID_9jby0x9jby0x9jby'
on conflict (entity_type, entity_id, locale, field)
  do update set value = excluded.value, updated_at = now();

/* ----------------------------------------------------------- the link */

update case_files
   set lead_media_id = (
         select m.id from media m
         where m.cloudinary_public_id = 'EIDVSNID_9jby0x9jby0x9jby'
       )
 where slug = 'egypt-acquisition';
