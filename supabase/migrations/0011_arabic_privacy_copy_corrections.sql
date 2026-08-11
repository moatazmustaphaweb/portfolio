-- Arabic corrections to the privacy and consent copy, 2026-08-11.
--
-- privacy_no_tracking: تتبّع reads closer to "stalk/trace" than neutral
--   "track", which made the sentence sound defensive. The replacement says
--   what actually happens — the session id dies with the tab, so on a return
--   visit there is nothing to recognise you by.
--
-- privacy_no_ip: dropped إطلاقاً. "Never" was already carried by لا; the
--   emphatic particle tipped a plain statement of fact into protesting.
--
-- consent_accept / consent_decline: أوافق / لا أوافق rather than
--   أوافق / لا شكراً. Decision 030 requires the two to be equal in weight, and
--   parallel construction is how that is achieved — لا شكراً is polite where
--   أوافق is decisive, which is a soft asymmetry in the opposite direction
--   from the usual dark pattern, but an asymmetry all the same.
--
-- privacy_location kept: أسجّل is accurate and no warmer alternative reads
--   as precisely.
--
-- Applied as `arabic_privacy_copy_corrections`.

update translations t set value = v.correct, updated_at = now()
from (values
  ('privacy_no_tracking', 'لا يمكنني التعرّف عليك عند عودتك.'),
  ('privacy_no_ip',       'لا أخزّن عناوين IP.'),
  ('consent_accept',      'أوافق'),
  ('consent_decline',     'لا أوافق')
) as v(key, correct)
join ui_strings u on u.key = v.key
where t.entity_type = 'ui_string'
  and t.entity_id = u.id
  and t.field = 'label'
  and t.locale = 'ar';
