-- 0040 — The Egypt cover's lead image becomes the background-removed cut-out.
--
-- Replaces `EIDVSNID_9jby0x9jby0x9jby` (0039) with
-- `Gemini_Generated_Image_9jby0x9jby0x9jby-Photoroom` — the same photograph of
-- an Egyptian national ID beside an Emirates ID, with the marble ground cut
-- away.
--
-- ── VERIFIED BEFORE THIS ROW WAS WRITTEN ────────────────────────────────────
--
--   HTTP/2 200 · content-type: image/png
--   fl_getinfo → {"input":{"width":848,"height":1264,"bytes":1323035}}
--
-- **848x1264 — IDENTICAL to the asset it replaces.** Same portrait aspect
-- (0.671), so the box `CloudinaryImage` reserves does not change and neither
-- does the cover's column geometry. Egypt's thesis still wraps at 718px.
--
-- ── IT HAS A REAL ALPHA CHANNEL ─────────────────────────────────────────────
--
-- Measured, not assumed from the `-Photoroom` suffix: mode RGBA, alpha extrema
-- 0..255, **44.7% of sampled pixels fully transparent**, all four corners at
-- alpha 0. It is a genuine cut-out.
--
-- Two things were checked because a flattened alpha would silently give this
-- image a background it was exported without:
--
--   1. `f_auto` NEGOTIATES TO ALPHA-CAPABLE FORMATS ONLY. Measured per Accept
--      header: `image/avif,image/webp` → webp; `image/webp` → webp; `*/*` →
--      png. Both carry alpha. Nothing in the negotiation flattens it.
--   2. `e_grayscale` PRESERVES ALPHA. The transform desaturates the colour
--      channels and leaves the alpha channel alone — extrema are still 0..255
--      on the delivered file. Egypt carries `nda = true`, so this matters.
--
-- ── WHAT IT LOOKS LIKE ON EACH THEME — see docs/status.md ───────────────────
--
-- Composited over both theme grounds rather than guessed. On dark (#000) the
-- cut-out reads well: pale cards, strong contrast, clean edge. On light (#fff)
-- the card silhouette largely dissolves, because the cards are near-white and
-- so is the ground. The asset this replaces carried its own marble background
-- and had an edge on both.
--
-- No transform is added here to compensate. A Cloudinary transform is
-- theme-blind — the URL is built server-side and the theme is a client-side
-- token — so `b_white` or similar would fix light by breaking dark. If a ground
-- is wanted it belongs on the figure element as a token-backed background,
-- which is theme-aware by construction. Flagged, not done.
--
-- ── ALT AND CAPTION ARE UNCHANGED, AND STILL TRUE ───────────────────────────
--
-- Same two cards, same arrangement, same comparison — only the ground is gone.
-- "National ID versus Emirates ID" and "The difference of the Egyptian national
-- ID and Emirates ID." describe this picture as accurately as they described
-- the last one.
--
-- ── THE OLD ROW IS KEPT ─────────────────────────────────────────────────────
--
-- `EIDVSNID_9jby0x9jby0x9jby` is left in `media`, unreferenced, with its
-- translations intact. Nothing points at it once the update below runs.

/* ------------------------------------------------------------------- media */

insert into media (cloudinary_public_id, width, height, format, redacted)
values ('Gemini_Generated_Image_9jby0x9jby0x9jby-Photoroom', 848, 1264, 'png', false)
on conflict (cloudinary_public_id) do update
  set width  = excluded.width,
      height = excluded.height,
      format = excluded.format;

/* ------------------------------------------------------- alt and caption */

insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, 'en', 'alt', 'National ID versus Emirates ID'
from media m
where m.cloudinary_public_id = 'Gemini_Generated_Image_9jby0x9jby0x9jby-Photoroom'
on conflict (entity_type, entity_id, locale, field)
  do update set value = excluded.value, updated_at = now();

insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, 'en', 'caption',
       'The difference of the Egyptian national ID and Emirates ID.'
from media m
where m.cloudinary_public_id = 'Gemini_Generated_Image_9jby0x9jby0x9jby-Photoroom'
on conflict (entity_type, entity_id, locale, field)
  do update set value = excluded.value, updated_at = now();

/* ------------------------------------------------------------- the switch */

update case_files
   set lead_media_id = (
         select m.id from media m
         where m.cloudinary_public_id
             = 'Gemini_Generated_Image_9jby0x9jby0x9jby-Photoroom'
       )
 where slug = 'egypt-acquisition';
