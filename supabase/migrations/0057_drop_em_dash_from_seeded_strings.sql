-- 0057 — the em dash comes out of every string a visitor reads.
--
-- Moataz ruled on 2026-08-25, launch week: no em dash (—) and no en dash (–)
-- anywhere on the site, in either language. The site's prose lives in Notion
-- and is being corrected there. THESE five strings do not: they are seeded,
-- so Notion has no copy of them and no sync would ever reach them.
--
-- ⚠️ NOT a blanket replace, and that is the whole instruction. His words were
-- "replace with the right punctuation in the context, don't just replace." A
-- dash does different work in different sentences, so each one below is a
-- separate reading:
--
--   form_success       pivot      → full stop.  Two independent clauses.
--   cv_subject_value   label      → colon.      A subject line naming its source.
--   privacy_location   definition → colon.      The second half defines the first.
--   two career titles  apposition → Arabic comma (U+060C). A qualifier on a job
--                                   title, not a new sentence.
--
-- The seed files themselves (0003, 0009, 0056) were corrected in the same task,
-- so a fresh `db reset` produces these values directly and this migration is a
-- no-op against a clean database. It exists for the database that is already
-- live, which is the one the site reads.
--
-- The `description` columns on `ui_strings` still contain em dashes and are
-- LEFT ALONE on purpose: nobody but a maintainer ever reads them, and the rule
-- is about what a visitor sees.

update translations
set value = 'Thanks. I’ll reply soon.'
where entity_type = 'ui_string' and locale = 'en'
  and value = 'Thanks — I’ll reply soon.';

update translations
set value = 'شكراً. سأردّ قريباً.'
where entity_type = 'ui_string' and locale = 'ar'
  and value = 'شكراً — سأردّ قريباً.';

update translations
set value = 'CV request: moatazmustapha.com'
where entity_type = 'ui_string' and locale = 'en'
  and value = 'CV request — moatazmustapha.com';

update translations
set value = 'طلب السيرة الذاتية: moatazmustapha.com'
where entity_type = 'ui_string' and locale = 'ar'
  and value = 'طلب السيرة الذاتية — moatazmustapha.com';

update translations
set value = 'I record approximate location: country and city.'
where entity_type = 'ui_string' and locale = 'en'
  and value = 'I record approximate location — country and city.';

update translations
set value = 'أسجّل الموقع التقريبي: الدولة والمدينة.'
where entity_type = 'ui_string' and locale = 'ar'
  and value = 'أسجّل الموقع التقريبي — الدولة والمدينة.';

update translations
set value = 'استشاري أول لتجربة وواجهة المستخدم، إقليمي'
where entity_type = 'career_role' and locale = 'ar' and field = 'title'
  and value = 'استشاري أول لتجربة وواجهة المستخدم — إقليمي';

update translations
set value = 'مصمم تجربة وواجهة المستخدم، عمل حر'
where entity_type = 'career_role' and locale = 'ar' and field = 'title'
  and value = 'مصمم تجربة وواجهة المستخدم — عمل حر';
