-- UAE Acquisition's cover is component artwork, same pattern as Egypt in
-- 0026: a token-bound SVG in designs/, not a Cloudinary asset. See that
-- migration's comment for the full reasoning — cover_kind/cover_component,
-- the redaction-trigger inapplicability, and why NDA covers no longer
-- desaturate (decision 050).
--
-- This row existed only in the live database until now — set by hand in the
-- same session the artwork was built, and never carried into a migration.
-- Flagged at the time: a rebuild from scratch would have silently reverted
-- UAE to a coverless card, no error, nothing to notice. Closed here.

update case_files
   set cover_kind = 'component',
       cover_component = 'uae-acquisition'
 where slug = 'uae-acquisition';
