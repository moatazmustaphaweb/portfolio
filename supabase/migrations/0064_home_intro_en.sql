-- Home intro, English only — decision 061 item 8 (task 011251026).
--
-- The English line becomes the translation of Moataz's existing Arabic one,
-- `أسعى لحلول بسيطة، تجعل الحياة أسهل`. The Arabic row is NOT touched: it is the
-- source, written by him (see 0015 on why the two are written, not translated
-- by a pass). About's H1 is unchanged.
--
-- An UPDATE, not an upsert: the row exists since 0015, and a missing row should
-- show as `UPDATE 0` rather than be silently created.

update translations t
set value = 'I look for simple solutions that make life easier.',
    updated_at = now()
from settings s
where s.key = 'intro'
  and t.entity_type = 'setting'
  and t.entity_id = s.id
  and t.locale = 'en'
  and t.field = 'value';

-- Expected: UPDATE 1. Read back:
--   select t.locale, t.value from translations t join settings s on s.id = t.entity_id
--   where t.entity_type = 'setting' and s.key = 'intro' order by t.locale;
