-- 0059 — Cervello gets a cover, and the gallery card that goes with it.
--
-- Moataz supplied the artwork on 2026-08-25 and asked for it to reach the site
-- directly. Cervello was the last published case file with no cover: its
-- gallery card rendered a title and nothing else.
--
-- TWO ASSETS, ONE COLUMN. `case_files` carries a single `cover_media_id`, and
-- `resolveCoverCard` in `lib/content/case-files.ts` finds the card-shaped
-- variant by the convention `<public_id>-card` in this same table. So both rows
-- are inserted and only the master is linked.
--
-- ⚠️ WHY THE CARD IS A HAND-FRAMED ASSET AND NOT LEFT TO THE PRESET.
-- The `card` preset is 640x400, `c_fill`, `g_auto`. This particular artwork is
-- a SPLIT COMPOSITION: the left half is a city photographed from above, the
-- right half is the same grid redrawn as a network of nodes and links. The
-- whole argument of the image is the seam between them. An automatic 1.6:1 fill
-- on a 3:2 source is free to favour one side and would cut the argument in
-- half. The card asset is therefore stored pre-cropped to 1536x960 with the
-- FULL WIDTH kept and the trim taken vertically, so `c_fill` at render is a
-- clean scale with nothing left to crop.
--
-- Rule 3 is intact: only `cloudinary_public_id` is stored here. Every URL is
-- still built at render from a public_id plus a named preset.
--
-- Rule 6: `redacted` is false on both. Cervello is not NDA work
-- (`case_files.nda = false`), so no treatment applies.

insert into media (cloudinary_public_id, width, height, format, redacted, sort_order)
values
  ('Cervello_-_Cover',      1536, 1024, 'png', false, 0),
  ('Cervello_-_Cover-card', 1536,  960, 'png', false, 0)
on conflict (cloudinary_public_id) do update
  set width  = excluded.width,
      height = excluded.height,
      format = excluded.format;

-- Alt text on both. The card is a crop of the same picture, so it describes the
-- same thing; the alt is not duplicated lazily, it is duplicated because the
-- image is the same image.
insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, v.locale::locale_code, 'alt', v.value
from media m
join (values
  ('en', 'An aerial view of a dense city grid, split down the middle. The left half is the city as photographed; the right half is the same blocks overlaid with a network of glowing nodes and the links between them'),
  ('ar', 'منظر جوي لشبكة مدينة كثيفة، مقسوم من المنتصف. النصف الأول هو المدينة كما صُوّرت، والنصف الآخر هو المربعات نفسها وقد غُطّيت بشبكة من العقد المضيئة والوصلات بينها')
) as v(locale, value) on true
where m.cloudinary_public_id in ('Cervello_-_Cover', 'Cervello_-_Cover-card')
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value;

update case_files
set cover_media_id = (select id from media where cloudinary_public_id = 'Cervello_-_Cover')
where slug = 'cervello';
