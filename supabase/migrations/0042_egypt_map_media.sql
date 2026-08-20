-- 0042 — The journey-containers diagram, on the Egypt cover's `map` slot.
--
-- The second image on a cover, and the reason 0041 exists: the `map` section
-- had been rendering at two-thirds width with unaddressable space beside it.
--
-- ── VERIFIED BEFORE THIS ROW WAS WRITTEN ────────────────────────────────────
--
--   HTTP/2 200 · content-type: image/png
--   fl_getinfo → {"input":{"width":1024,"height":768,"bytes":21450}}
--
-- ⚠️ LANDSCAPE, where the thesis image is portrait. 1024x768 is 4:3, against
-- the cut-out's 848x1264 at 0.671. In a one-third column it renders about
-- 357x268 — a short wide block beside taller text, not a tall one. The two
-- images on this cover are deliberately different shapes.
--
-- ── IT IS A DIAGRAM, AND MOSTLY TRANSPARENT ─────────────────────────────────
--
-- 84.5% of sampled pixels are fully transparent. The content is five labelled
-- boxes — Onboarding Journey, Document Capture & OCR, Customer Portal &
-- Notifications, Application Workflow, Fulfilment & AOF — in white type on
-- opaque dark fills.
--
-- Checked, because a diagram of light type is the case where a theme breaks it:
-- the boxes carry their own opaque fill, so white-on-dark survives a white
-- ground. It reads with MORE contrast on the light theme, not less.
--
-- ── e_grayscale IS A VISUAL NO-OP HERE ──────────────────────────────────────
--
-- Egypt carries `nda = true`, so the transform is applied — and changes
-- nothing visible, because the diagram is already monochrome. Recorded so the
-- next reader does not go looking for a treatment that is not there.
--
-- ── ALT IN BOTH LANGUAGES, NO CAPTION ───────────────────────────────────────
--
-- The first section image to ship with real Arabic alt rather than the English
-- fallback. No caption: the diagram labels itself, and a caption naming what
-- the boxes already say would be repetition.

/* ------------------------------------------------------------------- media */

insert into media (cloudinary_public_id, width, height, format, redacted)
values ('Slide_4_3_-_1', 1024, 768, 'png', false)
on conflict (cloudinary_public_id) do update
  set width  = excluded.width,
      height = excluded.height,
      format = excluded.format;

/* --------------------------------------------------------------------- alt */

insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, 'en', 'alt', 'The Journey Containers Image'
from media m where m.cloudinary_public_id = 'Slide_4_3_-_1'
on conflict (entity_type, entity_id, locale, field)
  do update set value = excluded.value, updated_at = now();

insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, 'ar', 'alt', 'صورة توضيحية لمكونات الرحلة'
from media m where m.cloudinary_public_id = 'Slide_4_3_-_1'
on conflict (entity_type, entity_id, locale, field)
  do update set value = excluded.value, updated_at = now();

/* -------------------------------------------------------------- attachment */

update cover_sections cs
   set media_id = (select m.id from media m
                   where m.cloudinary_public_id = 'Slide_4_3_-_1')
  from case_files cf
 where cf.id = cs.case_file_id
   and cf.slug = 'egypt-acquisition'
   and cs.slot = 'map';
