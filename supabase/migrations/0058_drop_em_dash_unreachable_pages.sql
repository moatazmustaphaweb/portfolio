-- 0058 — the last em dashes, on three pages the sync cannot reach.
--
-- Decision 058 removed the em dash from everything a visitor reads. Notion was
-- corrected across 34 pages in both languages and synced. These fourteen rows
-- survived, and the reason is not that anyone missed them:
--
--   • `Accessibility - Bilingual, RTL & Regulatory Comprehension` is listed by
--     the sync itself under "NOT YET IMPLEMENTED — comparison, accessibility
--     and chrome pages". It is PUBLISHED and renders at
--     /[locale]/work/egypt-acquisition/accessibility, and it has no write path.
--
--   • `Chapter - UAE / Application Tracking` carries `In MVP-1 = NO`, so it
--     falls outside the sync's scope — while `chapters.status` is `published`
--     and the page renders. Its rows are frozen at whatever an earlier sync
--     wrote.
--
--   • The Neobiz cover image's `alt` is stale in the same way.
--
-- So the corrected text exists in Notion and cannot get out. This migration
-- makes the database agree with the source until the write paths exist. Same
-- shape as the accessibility page's `Draft v1` line earlier the same day, and
-- the third time this class has surfaced in one session.
--
-- ⚠️ NOT a blanket replace. Each is read for what the dash was doing:
--
--   parentheses  where a PAIR enclosed a comma list — commas there collapse the
--                list into one flat sequence and change what is being counted
--   colon        where the second half defines or itemises the first
--   full stop    where the second half is a full clause that turns
--   comma        where a conjunction was already carrying the join
--
-- Arabic takes `،` (U+060C). No words are added or removed anywhere below.

-- ── media alt: a pair enclosing a list → parentheses ───────────────────────
update translations set value =
  'Withdrawal screen offering three reasons (not interested, incorrect details and will re-apply, or other), with the withdraw action disabled until one is chosen and "Continue application" as the primary button'
where entity_type = 'media' and locale = 'en' and field = 'alt'
  and value like 'Withdrawal screen offering three reasons —%';

update translations set value =
  'شاشة سحب الطلب وفيها ثلاثة أسباب (غير مهتم، أو بيانات خاطئة وسأعيد التقديم، أو سبب آخر)، وزر السحب معطّل حتى يُختار أحدها، و«متابعة الطلب» هو الزر الأساسي'
where entity_type = 'media' and locale = 'ar' and field = 'alt'
  and value like 'شاشة سحب الطلب وفيها ثلاثة أسباب —%';

update translations set value =
  'Two phones showing the NEO BIZ account application in Arabic (the task dashboard, company details, ownership, financial and regulatory sections), with an Egyptian commercial register and tax card behind them'
where entity_type = 'media' and locale = 'en' and field = 'alt'
  and value like 'Two phones showing the NEO BIZ account application in Arabic —%';

update translations set value =
  'هاتفان يعرضان طلب فتح الحساب في NEO BIZ بالعربية (لوحة المهام، وبيانات الشركة، والملكية، والتفاصيل المالية، والجهات التنظيمية)، وخلفهما سجل تجاري وبطاقة ضريبية مصريان'
where entity_type = 'media' and locale = 'ar' and field = 'alt'
  and value like 'هاتفان يعرضان طلب فتح الحساب في NEO BIZ بالعربية —%';

-- ── captions: definition and list lead-ins → colon ─────────────────────────
update translations set value =
  'What the argument won: the regulatory section in Arabic, mirrored structurally rather than translated over an English skeleton.'
where entity_type = 'media' and locale = 'en' and field = 'caption'
  and value like 'What the argument won —%';

update translations set value =
  'ما كسبته الحجة: القسم التنظيمي بالعربية، منعكسًا بنيويًا لا مترجمًا فوق هيكل إنجليزي.'
where entity_type = 'media' and locale = 'ar' and field = 'caption'
  and value like 'ما كسبته الحجة —%';

update translations set value =
  'The question, and both ways of answering it: a document, or a sentence. The heading says what is wrong with the file, not that the application failed.'
where entity_type = 'media' and locale = 'en' and field = 'caption'
  and value like 'The question, and both ways of answering it —%';

update translations set value =
  'السؤال، وطريقتا الرد عليه: مستند، أو جملة. والعنوان يقول ما الخطأ في الملف، لا أن الطلب سقط.'
where entity_type = 'media' and locale = 'ar' and field = 'caption'
  and value like 'السؤال، وطريقتا الرد عليه —%';

-- ── a pivot whose second half is a full clause → full stop ─────────────────
update translations set value =
  'Three doors on the first screen, and the third is both. Resuming an unfinished application and tracking a submitted one are the same way in.'
where entity_type = 'media' and locale = 'en' and field = 'caption'
  and value like 'Three doors on the first screen, and the third is both —%';

-- Arabic takes a colon here rather than a full stop: the second half itemises
-- the two things "اثنين" has just counted, so it completes the clause instead
-- of turning from it.
update translations set value =
  'ثلاثة مسارات في الشاشة الأولى، والثالث يجمع اثنين: استكمال طلب لم يكتمل، ومتابعة طلب قُدّم، مدخل واحد.'
where entity_type = 'media' and locale = 'ar' and field = 'caption'
  and value like 'ثلاثة مسارات في الشاشة الأولى، والثالث يجمع اثنين —%';

-- ── a join already carrying "so" → comma ───────────────────────────────────
update translations set value =
  'Take the customer portal that already worked on the web and put it inside the mobile app, so applying and tracking happen in the same place.'
where value like 'Take the customer portal that already worked on the web and put it inside the mobile app —%';
