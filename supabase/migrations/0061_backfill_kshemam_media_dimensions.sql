-- 0061 — pixel dimensions for the six Kshemam Android screens (task 001221026)
--
-- Same reason as 0060: `scripts/sync-notion.ts` (the `media` upsert near line
-- 1207) writes only `cloudinary_public_id` and `redacted`, so every `[cld]` tag
-- synced since 0060 arrives with NULL width and height. A figure with NULL
-- dimensions reserves a square box and cannot be told portrait from landscape,
-- so the device frame (decided by aspect ratio) is not applied.
--
-- The values are Cloudinary's own for these six assets — 720x1600, verified by
-- devops against Cloudinary — not measured from a render or inferred.
--
-- GUARDED: only these six public_ids, and only where BOTH dimensions are still
-- NULL. A row that already carries dimensions is left alone, and re-running
-- this is a no-op. No other case file's media is touched.
--
-- ⚠️ STILL A BACKFILL, NOT A FIX. The sync gap named in 0060 is open.

update media
   set width = 720, height = 1600
 where cloudinary_public_id in (
         'Kshemam/Android/do-you-feel-okay',
         'Kshemam/Android/symptoms',
         'Kshemam/Android/circle-in-risk',
         'Kshemam/Android/home-rest',
         'Kshemam/Android/home-in-risk',
         'Kshemam/Android/user-type'
       )
   and width is null
   and height is null;
