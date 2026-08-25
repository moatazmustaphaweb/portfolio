-- Consent banner copy + the four /how-this-site-works claims (decisions 029, 030).
--
-- Every claim below is literally true and testable against the running system,
-- not aspirational. Worded plainly on purpose: no cookie lifetimes, no talk of
-- fingerprinting, nothing a visitor would have to decode.
--
-- ⚠️ Arabic needs a native review pass like the previous batch.
--
-- Applied as `seed_consent_and_privacy_copy`.

with strings(key, context, en, ar) as (values
  ('consent_message', 'GA consent banner body',
   'I use Google Analytics to see which countries my work reaches. It sets cookies. You can say no.',
   'أستخدم Google Analytics لأعرف الدول التي تصل إليها أعمالي. يضع ملفات تعريف الارتباط. يمكنك الرفض.'),
  ('consent_accept', 'GA consent banner — accept. Equal weight with decline.',
   'Allow', 'أوافق'),
  ('consent_decline', 'GA consent banner — decline. Equal weight with accept.',
   'No thanks', 'لا شكراً'),

  ('privacy_title', '/how-this-site-works heading',
   'What this site records', 'ما الذي يسجّله هذا الموقع'),
  ('privacy_location', 'Claim 1 — verifiable',
   'I record approximate location: country and city.',
   'أسجّل الموقع التقريبي: الدولة والمدينة.'),
  ('privacy_no_ip', 'Claim 2 — verifiable: no column can hold an IP',
   'I never store IP addresses.',
   'لا أخزّن عناوين IP إطلاقاً.'),
  ('privacy_no_tracking', 'Claim 3 — verifiable: sessionStorage, dies with the tab',
   'I cannot follow you between visits.',
   'لا أستطيع تتبّعك بين الزيارات.'),
  ('privacy_ga', 'Claim 4 — verifiable: no GA script loads before consent',
   'I use Google Analytics only if you allow it, and you can decline.',
   'أستخدم Google Analytics فقط إذا سمحت بذلك، ويمكنك الرفض.')
), upsert_keys as (
  insert into ui_strings (key, context)
  select key, context from strings
  on conflict (key) do update set context = excluded.context
  returning id, key
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'ui_string', k.id, l.locale::locale_code, 'label', l.value
from strings s
join upsert_keys k on k.key = s.key
cross join lateral (values ('en', s.en), ('ar', s.ar)) as l(locale, value)
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value, updated_at = now();
