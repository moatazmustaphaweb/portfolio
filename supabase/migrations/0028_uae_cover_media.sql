-- UAE Acquisition moves from a component cover to a Cloudinary asset.
--
-- The inline path exists to give covers token binding — an SVG in the repo
-- follows the theme, a Cloudinary asset cannot. That is traded away here
-- deliberately: the artwork is promotional, it is Moataz's own, and it belongs
-- on the standard media path like every other image on the site.
--
-- TWO ASSETS, ON PURPOSE. The square master is the cover page; the 1.6:1 is a
-- hand-made crop for the gallery card, because that slot crops with `c_fill`
-- and `g_auto` picks the centre by content analysis rather than by intent.
-- The card variant is found by convention — `<public_id>-card` — resolved in
-- lib/content/case-files.ts against this table, NOT against Cloudinary, so a
-- missing variant is a null and a fallback rather than a 404 in the browser.
-- No schema change was needed for it.
--
-- redacted = false: the artwork is promotional, every screen in it is dummy
-- data, and the visual design differs from the production product. Confirmed
-- by Moataz. The three guards from 0007 therefore accept it — they key on
-- `media.redacted`, never on `case_files.nda`, which is the distinction that
-- lets an NDA case file carry a non-NDA cover.
--
-- ⚠️ `case_files.nda` is still true, so `CloudinaryImage` applies `e_grayscale`
-- (amendment 036). Moving off the component path moves this cover back under
-- that treatment — decision 050 had scoped it out only because the transform
-- could not reach an inline SVG. What renders is the artwork desaturated.
--
-- Alt text is a `translations` row, not a column, and it is load-bearing:
-- CloudinaryImage OMITS the image entirely when alt is undefined, so a missing
-- translation renders nothing at all rather than an unlabelled image.

insert into media (cloudinary_public_id, width, height, format, redacted)
values ('uae-acquisition',      2400, 2400, 'svg', false),
       ('uae-acquisition-card', 2560, 1600, 'svg', false)
on conflict (cloudinary_public_id) do update
   set width    = excluded.width,
       height   = excluded.height,
       format   = excluded.format,
       redacted = excluded.redacted;

insert into translations (entity_type, entity_id, locale, field, value)
select 'media', m.id, t.locale::locale_code, 'alt', t.value
  from media m
  cross join (values
    ('en', 'Three screens from the banking acquisition app: face recognition, debit card customisation, required documents'),
    ('ar', '٣ شاشات لتطبيق الاستحواذ البنكي: التعرف على الوجه، تخصيص بطاقة الخصم، الوثائق المطلوبة')
  ) as t(locale, value)
 where m.cloudinary_public_id in ('uae-acquisition', 'uae-acquisition-card')
on conflict (entity_type, entity_id, locale, field)
  do update set value = excluded.value, updated_at = now();

-- ONE statement, not two. `cover_media_id` and `cover_component` are mutually
-- exclusive by CHECK (0026): setting the media id while the component is still
-- set violates it, and clearing the component first leaves cover_kind
-- 'component' with a null component, which violates it too. Both orderings
-- fail, so all three columns move together.
update case_files
   set cover_kind      = 'media',
       cover_component = null,
       cover_media_id  = (select id from media where cloudinary_public_id = 'uae-acquisition')
 where slug = 'uae-acquisition';
