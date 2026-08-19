# جرد أوسمة Cloudinary — ملف مصر

**قاعدة البيانات:** `collection://7a8ab2e1-08d1-4286-a4df-f2e87b85c219`
**الإجمالي:** 140 وسماً · 70 إنجليزي · 70 عربي · عشر صفحات

## الصيغة

```
`[cld] <public ID>` `[alt] <وصف>` `[caption] <تعليق>`
```

```regex
`\[cld\]\s*([^`]+)`\s*`\[alt\]\s*([^`]+)`\s*`\[caption\]\s*([^`]+)`
```

## قاعدة اختيار اللغة

| الرحلة | التصميم | ما طُبِّق |
|---|---|---|
| 1 · Onboarding | EN + AR | لكل صفحة شاشاتها بلغتها |
| 2 · Application Workflow | EN فقط | نفس المعرّف في الصفحتين |
| 3 · Customer Portal | EN + AR | لكل صفحة شاشاتها بلغتها |
| 4 · Fulfilment | EN فقط | نفس المعرّف في الصفحتين |
| 5 · AOF | EN فقط | نفس المعرّف في الصفحتين |
| 6 · Emailers | EN + AR | لكل صفحة شاشاتها بلغتها |

---

# 1 · الفصل الأول — Onboarding Journey

## الصفحة الإنجليزية · 16 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | The officer fills the form. The customer signs — usually without reading it. | `Egypt Acquisition/5. AOF (Account Opening Form) EGY/Pages/07-regulatory-declaration-fatca-and-pep` | Paper account opening form, regulatory declaration page covering FATCA and politically exposed persons | The page the officer fills on the customer's behalf. Every question here is one the customer answers out loud and signs without reading. |
| 2 | Two weeks to a month, sometimes longer. | `Egypt Acquisition/5. AOF (Account Opening Form) EGY/Pages/01-cover-page` | Cover page of the paper account opening form | The artefact the whole journey replaces — eighteen pages, filled by hand, then typed again by someone else. |
| 3 | That argument won. The customer can switch between Arabic and English inside the regulatory section… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic` | FATCA declaration rendered in Arabic, right-to-left, with the stepper and guidance rail mirrored | What the argument won — the regulatory section in Arabic, mirrored structurally rather than translated over an English skeleton. |
| 4 | And I lost Arabic-first permanently — correctly, I now think… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Onboard/Signup/registration-arabic-default` | Registration screen in Arabic, the first screen of the journey | The compromise that shipped — language chosen once, on the first screen, and carried the whole way. Not what I asked for, and defensible. |
| 5 | The regulatory section was the only thing all ten participants complained about. | `Egypt Acquisition/1. Onboarding Journey/English/Regulatory declaration/FATCA/fatca-default` | FATCA declaration screen in English, as first encountered | The screen every participant complained about — eight of ten could not define the terms it asks them to certify. |
| 6 | A staged journey that mirrors the branch conversation… | `Egypt Acquisition/1. Onboarding Journey/English/Onboard/Signup/01-sign-up-intiate` | Sign-up screen showing the four eligibility questions | Where the journey begins — four questions that decide eligibility before the customer invests a minute more. |
| 7 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/English/Ownership details/Dashboard/key-individuals-all-added` | Ownership dashboard listing every Key Individual as a separate card | The ownership dashboard — every Key Individual added, each a card with its own document state. |
| 8 | OCR on the commercial register and national ID… | `Egypt Acquisition/1. Onboarding Journey/English/Company details/company-details-pre-filled` | Company details form with fields pre-filled from the uploaded commercial register | Company details, pre-filled from the uploaded commercial register — the customer confirms instead of typing. |
| 9 | Contextual guidance in place of the officer… | `Egypt Acquisition/1. Onboarding Journey/English/Regulatory declaration/PEP declarations/modal-pep-definition-english` | Modal defining what a politically exposed person is, in plain language | The PEP definition, explained where the question is asked — the officer's spoken explanation, rebuilt as a modal. |
| 10 | Nine features carry the journey: signup · company documents and OCR… | `Egypt Acquisition/1. Onboarding Journey/English/Onboard/Eligible new applicant/03-account-select-plan-prime-selected` | Account plan selection screen with three tiers, Prime selected | Plan selection for the eligible applicant — three tiers, one screen. |
| 11 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/English/Onboard/Non Eligible new applicant/04-non-eligible-rm-assisted` | Outcome screen for a non-eligible company, offering Relationship Manager assistance | The deliberate rejection path — a non-eligible company is handed to a Relationship Manager, not to a dead end. |
| 12 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/English/Ownership details/Key individual - data/confirm-individual-non-egyptian-non-resident-filled` | Key Individual form completed for a non-Egyptian, non-resident partner | One cell of the ownership matrix — a non-Egyptian, non-resident partner, with the fields that case actually requires. |
| 13 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/English/Regulatory declaration/FATCA/fatca-non-financial-passive-us-citizens-yes-ubo-with-ssn` | FATCA declaration branch for a passive non-financial entity with a US-person beneficial owner and SSN field | The deepest FATCA branch — passive non-financial entity, US persons, UBO with SSN — designed so only the customers it applies to ever see it. |
| 14 | But the change was in the wording, not the count — five questions stayed five questions… | `Egypt Acquisition/1. Onboarding Journey/English/Regulatory declaration/Sanction/sanctions-filled` | Sanctions declaration screen with all five questions answered | The sanctions declaration that shipped — five questions that stayed five, phrased more clearly than they began. |
| 15 | More importantly, the data the customer enters is the data that reaches Flex… | `Egypt Acquisition/1. Onboarding Journey/English/Post-Submit/Scheduling visit/application-submitted-visit-selected` | Submission confirmation screen with a company visit selected | The submission close — the customer chooses where the one remaining human meeting happens. |
| 16 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/English/Post-Submit/Scheduling visit/mashreq-branches` | Branch selection list showing Mashreq branches | Or they come to the bank — the branch list, inside the same screen. The journey removes re-typing, not the human. |

## الصفحة العربية · 16 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | يملأ الموظف النموذج. يوقّع العميل — غالبًا دون أن يقرأ. | `Egypt Acquisition/5. AOF (Account Opening Form) EGY/Pages/07-regulatory-declaration-fatca-and-pep` | صفحة الإقرار التنظيمي في نموذج فتح الحساب الورقي، تغطي FATCA والأشخاص المعرّضين سياسيًا | الصفحة التي يملؤها الموظف نيابةً عن العميل. كل سؤال فيها يجيب عنه العميل شفاهةً ثم يوقّع دون أن يقرأ. |
| 2 | من أسبوعين إلى شهر، وأحيانًا أطول. | `Egypt Acquisition/5. AOF (Account Opening Form) EGY/Pages/01-cover-page` | غلاف نموذج فتح الحساب الورقي | القطعة التي تستبدلها الرحلة كلها — ثماني عشرة صفحة، تُملأ باليد، ثم يعيد إدخالها شخص آخر. |
| 3 | تلك الحجة كسبت. يستطيع العميل التبديل بين العربية والإنجليزية… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic` | إقرار FATCA بالعربية، من اليمين إلى اليسار، مع انعكاس المُرحّل وشريط الإرشاد | ما كسبته الحجة — القسم التنظيمي بالعربية، منعكسًا بنيويًا لا مترجمًا فوق هيكل إنجليزي. |
| 4 | وخسرتُ العربية أولاً نهائيًا — وأظن اليوم أن ذلك كان صوابًا… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Onboard/Signup/registration-arabic-default` | شاشة التسجيل بالعربية، وهي أول شاشة في الرحلة | التسوية التي صدرت — لغة تُختار مرة واحدة، في الشاشة الأولى، وتسري الطريق كله. ليس ما طلبته، وقابل للدفاع. |
| 5 | وكان القسم التنظيمي الشيء الوحيد الذي اشتكى منه العشرة جميعًا. | `Egypt Acquisition/1. Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic-non-financial` | شاشة إقرار FATCA بالعربية لمنشأة غير مالية | الشاشة التي اشتكى منها كل مشارك — ثمانية من عشرة لم يستطيعوا تعريف المصطلحات التي تطلب منهم الإقرار بها. |
| 6 | رحلة مُرحَّلة تحاكي محادثة الفرع… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Onboard/Signup/registration-arabic-filled` | شاشة التسجيل بالعربية وقد اكتملت حقولها | حيث تبدأ الرحلة — أسئلة تحسم الأهلية قبل أن يستثمر العميل دقيقة أخرى. |
| 7 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/Arabic/Ownership details/Dashboard/key-individuals-arabic-multiple-added` | لوحة الملكية بالعربية وقد أُضيف إليها عدة أشخاص رئيسيين | لوحة الملكية — كل Key Individual بطاقة مستقلة لها حالة مستنداتها الخاصة. |
| 8 | OCR على السجل التجاري والبطاقة الشخصية… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Company details/company-profile-arabic-filled` | نموذج بيانات الشركة بالعربية وقد امتلأت حقوله من المستندات المرفوعة | بيانات الشركة، مُعبّأة من السجل التجاري المرفوع — العميل يؤكّد بدل أن يكتب. |
| 9 | إرشاد سياقي مكان الموظف… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Regulatory declaration/PEP declarations/pep-info-modal-arabic` | نافذة تعرّف بالشخص المعرّض سياسيًا بلغة مفهومة | تعريف PEP، مشروحًا عند موضع السؤال — شرح الموظف الشفوي، مُعاد بناؤه نافذةً. |
| 10 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/Arabic/Onboard/Eligible new applicant/account-select-plan-arabic-prime-selected` | شاشة اختيار الباقة بالعربية بثلاث فئات | اختيار الباقة لمن تنطبق عليه الأهلية — ثلاث فئات، شاشة واحدة. |
| 11 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/Arabic/Onboard/Non Eligible new applicant/non-eligible-arabic-rm-assisted` | شاشة نتيجة لشركة غير مؤهلة، تعرض مساعدة مدير العلاقة | مسار الرفض المقصود — الشركة غير المؤهلة تُسلّم إلى مدير علاقة، لا إلى طريق مسدود. |
| 12 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/Arabic/Ownership details/Key individual - data/confirm-individual-arabic-non-egyptian-filled` | نموذج الشخص الرئيسي بالعربية لشريك غير مصري | خلية واحدة من مصفوفة الملكية — شريك غير مصري، بالحقول التي تطلبها حالته فعلًا. |
| 13 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic-non-financial-us-persons-2-ubos` | فرع FATCA بالعربية لمنشأة غير مالية بأشخاص أمريكيين ومالكَين مستفيدين | أعمق فروع FATCA — مُصمّم بحيث لا يراه إلا من ينطبق عليه. |
| 14 | لكن التغيير كان في الصياغة لا في العدد — خمسة أسئلة ظلت خمسة… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Regulatory declaration/Sanction/sanctions-arabic` | شاشة إقرار العقوبات بالعربية | إقرار العقوبات كما صدر — خمسة أسئلة ظلت خمسة، بصياغة أوضح مما بدأت. |
| 15 | والأهم: البيانات التي يُدخلها العميل هي البيانات التي تصل إلى Flex… | `Egypt Acquisition/1. Onboarding Journey/Arabic/Post-Submit/Scheduling visit/application-submitted-arabic-verification-choice` | شاشة تأكيد التقديم بالعربية مع اختيار طريقة التحقق | ختام التقديم — العميل يختار أين يقع اللقاء البشري الوحيد المتبقي. |
| 16 | (نفس السطر) | `Egypt Acquisition/1. Onboarding Journey/Arabic/Post-Submit/Scheduling visit/branch-selection-arabic` | قائمة اختيار الفروع بالعربية | أو يأتي إلى البنك — قائمة الفروع، داخل الشاشة نفسها. الرحلة تُزيل إعادة الكتابة، لا الإنسان. |

---

# 2 · الفصل الثاني — Application Workflow

> الرحلة إنجليزية فقط. **نفس المعرّفات في الصفحتين**، والفرق في الوصف والتعليق.

## الصفحة الإنجليزية · 10 أوسمة

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | Maker and checker are different people… That separation is the reason the rest of the design can be as fast as it is. | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/04-application-list-default` | Application queue listing submitted applications with status, risk level and turnaround time | The queue an officer opens each morning — the folder on a desk, replaced by a list that knows how long it has been waiting. |
| 2 | Two systems came inside… the round trips that were consuming the turnaround time disappear. | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/17-ename-screening-summary-report` | Name screening summary report grouped by conclusion for every individual and company on the application | Name screening, brought inside. This used to arrive as a PDF from a separate system — readable, but nothing could be done to it. |
| 3 | (نفس السطر) | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/31-mandates-rules-list` | Mandate rules list showing signing authority rules for the account | Mandates, the second system folded in — built here rather than in a third place the officer had to open. |
| 4 | The replacement lands in place… at fulfilment the officer sees only the current version. | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/24-modal-raise-exception-overlay` | Modal for raising an exception, with a classified reason and the specific document it points at | Raising an exception — the classification is not reporting metadata. It is the address the replacement will land at. |
| 5 | The invisible phone call became a channel with a record. | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/36-exception-trail` | Exception trail listing every query raised on an application with reason, stage, status, author and timestamp | The trail — not a log of failures, but a record of the conversation the bank used to have by phone and never wrote down. |
| 6 | The referral transfers responsibility, not the file. | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/35-decision-exceptions-review` | Decision panel with unresolved exceptions surfaced above the outcome selection | The five outcomes, with what is still outstanding shown above them — the officer sees what is unresolved before choosing, not after. |
| 7 | (نفس السطر) | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/34-decision-need-customer-clarification` | Decision screen for the need-customer-clarification outcome, with structured reasons | One outcome in full — every one of the five carries a structured reason, because a decision without its reason cannot be replaced automatically later. |
| 8 | So I proposed selection and a bulk action. | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/18-ename-screening-match-details-expanded` | A name screening row expanded to show the matched name, service hit ID, risk category and reason | What the watching found — one row, opened, judged, closed. Then the next. On a report that routinely runs to dozens. |
| 9 | (نفس السطر) | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/06-application-list-filters-applied` | Application list with filters applied, narrowing the queue | Filtering and selection — safe here only because the decision sits downstream, in a different pair of hands. |
| 10 | Errors are not made impossible — they are made attributable… | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/37-audit-log` | Audit log recording which unit held the application, when it was assigned, picked up and released, timed to the second | The alternative to preventing the error — every action owned, timestamped, and readable by someone who was not in the room. |
| 11 | The service level is observable rather than asserted… | `Egypt Acquisition/2. BB Egypt - Application Workflow/Dashboard/05-application-list-notification-banner` | Application list with a notification banner announcing newly arrived work | The service level, made observable — risk, turnaround and status on the surface, so nobody has to ask how long something has been sitting. |

## الصفحة العربية · 10 أوسمة

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | وهذا الفصل تحديدًا هو ما سمح لبقية التصميم أن يكون بهذه السرعة… | `…/Dashboard/04-application-list-default` | قائمة الطلبات المقدمة مع الحالة ومستوى الخطورة وزمن الإنجاز | القائمة التي يفتحها الموظف كل صباح — الملف على المكتب، وقد صار قائمة تعرف كم انتظرت. |
| 2 | فاختفت الرحلات المتكررة بين الأنظمة التي كانت تلتهم وقت الإنجاز. | `…/Dashboard/17-ename-screening-summary-report` | تقرير فحص الأسماء مجمّعًا بحسب نتيجة كل فرد وشركة في الطلب | فحص الأسماء، وقد دخل إلى الداخل. كان يصل من نظام منفصل بصيغة PDF — يُقرأ، ولا يُفعل به شيء. |
| 3 | (نفس السطر) | `…/Dashboard/31-mandates-rules-list` | قائمة قواعد التفويضات وصلاحيات التوقيع على الحساب | التفويضات، وهي النظام الثاني الذي دخل — تُبنى هنا لا في مكان ثالث يضطر الموظف لفتحه. |
| 4 | فتصنيف الاستثناء ليس بيانات تُجمع للتقارير — بل هو ما يحدد أي ملف بالضبط سيتم استبداله. | `…/Dashboard/24-modal-raise-exception-overlay` | نافذة رفع استثناء مع سبب مصنّف والمستند المحدد الذي تشير إليه | رفع الاستثناء — التصنيف هنا ليس بيانات للتقارير، بل العنوان الذي سيحطّ عنده البديل. |
| 5 | أي أن المكالمة الهاتفية التي لم تكن تُسجَّل صارت قناة لها سجل كامل. | `…/Dashboard/36-exception-trail` | سجل الاستثناءات يعرض كل استفسار بسببه ومرحلته وحالته وكاتبه ووقته | السجل — ليس سجل إخفاقات، بل محضر المحادثة التي كان البنك يجريها هاتفيًا ولا يكتبها. |
| 6 | بعد أن يتحقق من أنظمة أخرى لا يراها هذا النظام أصلًا. | `…/Dashboard/35-decision-exceptions-review` | لوحة القرار والاستثناءات غير المغلقة معروضة فوق منطقة اختيار المخرج | المخارج الخمسة، وما زال معلقًا معروض فوقها — الموظف يرى ما لم يُحسم قبل أن يختار، لا بعده. |
| 7 | (نفس السطر) | `…/Dashboard/34-decision-need-customer-clarification` | شاشة مخرج طلب التوضيح من العميل مع أسباب مصنّفة | مخرج واحد بالتفصيل — لكل من الخمسة سبب مصنّف، لأن قرارًا بلا سببه لا يمكن أن يُستبدل تلقائيًا لاحقًا. |
| 8 | مع إجراء مجمّع (bulk action) يُطبَّق على المحدد دفعة واحدة. | `…/Dashboard/18-ename-screening-match-details-expanded` | صف من نتائج فحص الأسماء مفتوح يعرض الاسم المطابق وفئة الخطورة والسبب | ما أظهرته المراقبة — صف يُفتح، ويُحكم عليه، ويُغلق. ثم الذي يليه. في تقرير يمتد إلى عشرات النتائج. |
| 9 | (نفس السطر) | `…/Dashboard/06-application-list-filters-applied` | قائمة الطلبات مع تطبيق الفلاتر | الفلترة والاختيار المتعدد — وهو آمن هنا فقط لأن القرار يقع لاحقًا في يد أخرى. |
| 10 | وفي الأنظمة المنظَّمة، هذا عادةً هو التصميم الأكثر أمانة وواقعية. | `…/Dashboard/37-audit-log` | سجل التدقيق يوثّق أي وحدة حملت الطلب ومتى أُسند ومتى التُقط ومتى أُطلق، بالثانية | البديل عن منع الخطأ — كل فعل له صاحب ووقت، ويقرأه من لم يكن في الغرفة. |
| 11 | أي أن مستوى الخدمة مرصود بالأرقام لا مُدَّعى… | `…/Dashboard/05-application-list-notification-banner` | قائمة الطلبات مع شريط إشعار يعلن وصول عمل جديد | مستوى الخدمة، مرصودًا — الخطورة وزمن الإنجاز والحالة على السطح، فلا يحتاج أحد أن يسأل كم طال انتظار شيء. |

---

# 3 · الفصل الثالث — Customer Portal & Notifications

## الصفحة الإنجليزية · 13 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | And language can be switched before entry, not after. | `Egypt Acquisition/3. NEO BIZ Acquisition Customer Portal - Egypt/English/Customer portal/44-app-overview-submitted-no-queries` | Portal overview for a submitted application with no open queries | Arriving with nothing waiting — the state most customers find, and the one a status page has to earn the right to show. |
| 2 | Where something is waiting on them, a banner sits above it with a direct way in. | `…/English/Customer portal/43-app-overview-queries-awaiting-response` | Portal overview with a banner announcing queries awaiting the customer's response | The same screen when something is waiting — the banner sits above the road, not inside it. |
| 3 | …because nothing told the customer what "complete" looked like before they tried. | `…/English/Customer portal/55-modal-document-guidelines-company` | Modal setting out what a complete company document must contain | What "complete" looks like, said before the customer tries — the answer to the commercial register that arrived as one page. |
| 4 | Those are answered in text. | `…/English/Exceptians/67-query-nature-of-business` | Query asking the customer to explain the nature of their business, answered in free text | A query with no document to upload — the officer's spoken question, kept as a question. |
| 5 | (نفس السطر) | `…/English/Exceptians/61-query-update-tax-card` | Query requesting an updated tax card, with acceptance criteria and an upload area | And one with a document — the same wording the customer already met at onboarding, so no second vocabulary has to be learned. |
| 6 | …so the customer sees a conversation rather than an accumulating list of apparent failures. | `…/English/Customer portal/48-pending-queries-tax-card-submitted` | Pending queries tab showing a tax card response submitted by the customer | Resolved the moment the customer is done — not when the bank agrees. The only question they can act on is whether anything is waiting on them. |
| 7 | (نفس السطر) | `…/English/Customer portal/49-resolved-queries-national-id-updated` | Resolved queries tab showing a national ID that has been updated | One question across however many turns it takes — a thread, not an accumulating list of apparent failures. |
| 8 | Fourteen emails, each in English and Arabic, designed end to end… | `Egypt Acquisition/6. Emailer's (NEOBiz) EGYPT/English/01-case-creation` | Case creation email confirming the application has been started | The first email — the application number reaches the customer before they know they will need it. |
| 9 | (نفس السطر) | `…/English/06-exception-raised-from-governance-partner-name` | Exception raised email naming the specific partner the query concerns | The variant that names the partner — because "a document is missing" is not an instruction anyone can act on. |
| 10 | An open exception gets a reminder. Nothing lapses silently. | `…/English/03-case-termination-alert-before-submission` | Warning email sent before an application is terminated for inactivity | The warning that precedes the closing — nothing lapses silently, and the customer is told twice before anything ends. |
| 11 | (نفس السطر) | `…/English/07-reminder-on-raised-exception-by-governance` | Reminder email about an exception still awaiting the customer's response | The reminder on an open question — the phone call that used to depend on whether someone remembered to make it. |
| 12 | When it completes, the data is removed and the customer can start a fresh application. | `…/English/Customer portal/51-withdrawal-survey-reason-selected` | Withdrawal survey with a reason selected by the customer | The exit, built properly — room to ask why, and enough friction that a reaction has time to become a decision. |
| 13 | (نفس السطر) | `…/English/Customer portal/54-application-withdrawn-success` | Confirmation screen after an application has been withdrawn | The door, found. An applicant who wants out and cannot leave stays in the system as a ghost. |
| 14 | …the phone call became a channel with a record, and the customer stopped waiting in the dark. | `…/English/Customer portal/57-group-app-overview-with-queries` | Portal overview and query list shown together for an application with open queries | The whole channel in one frame — the road, and the questions along it. Neither existed before; both were a phone call nobody wrote down. |

## الصفحة العربية · 13 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | واختيار اللغة متاح قبل الدخول، لا بعده. | `…/Arabic/Customer portal/44-app-overview-submitted-no-queries` | نظرة عامة على طلب مُقدّم بالعربية دون استفسارات معلقة | الوصول ولا شيء ينتظر — الحالة التي يجدها أغلب العملاء، والتي يجب أن تستحق صفحة الحالة عرضها. |
| 2 | وحيث ينتظره إجراء، يظهر فوقه شريط تنبيه بمدخل مباشر إليه. | `…/Arabic/Customer portal/43-app-overview-queries-awaiting-response` | نظرة عامة بالعربية مع شريط يعلن استفسارات تنتظر رد العميل | الشاشة نفسها حين ينتظر شيء — الشريط يقع فوق الطريق، لا داخله. |
| 3 | …لأن أحدًا لم يخبر العميل كيف يبدو المستند «المكتمل» قبل أن يحاول رفعه. | `…/Arabic/Customer portal/55-modal-document-guidelines-company` | نافذة بالعربية توضح ما يجب أن يحتويه مستند الشركة المكتمل | كيف يبدو «المكتمل»، مقولًا قبل أن يحاول العميل — الرد على السجل التجاري الذي وصل صفحة واحدة. |
| 4 | وهذه تُجاب نصًا مباشرة. | `…/Arabic/Exceptians/67-query-nature-of-business` | استفسار بالعربية يطلب شرح طبيعة نشاط الشركة، يُجاب نصًا حرًا | استفسار بلا مستند يُرفع — سؤال الموظف الشفوي، محفوظًا سؤالًا. |
| 5 | (نفس السطر) | `…/Arabic/Exceptians/61-query-update-tax-card` | استفسار بالعربية يطلب تحديث البطاقة الضريبية مع معايير القبول ومنطقة رفع | واستفسار بمستند — بنفس الصياغة التي قابلها العميل في الرحلة، فلا يتعلم مصطلحًا ثانيًا. |
| 6 | فيرى العميل محادثة متصلة بدل قائمة إخفاقات تتراكم أمامه. | `…/Arabic/Customer portal/48-pending-queries-tax-card-submitted` | تبويب الاستفسارات المعلقة بالعربية وقد أرسل العميل البطاقة الضريبية | «تم الرد» لحظة ينتهي العميل — لا حين يقبل البنك. السؤال الوحيد الذي يملك التصرف حياله: هل ينتظرني شيء؟ |
| 7 | (نفس السطر) | `…/Arabic/Customer portal/49-resolved-queries-national-id-updated` | تبويب الاستفسارات المُجابة بالعربية وقد حُدّثت البطاقة الشخصية | سؤال واحد عبر ما يلزم من جولات — محادثة متصلة، لا قائمة إخفاقات تتراكم. |
| 8 | ويتبع من هذه القائمة أمران: | `Egypt Acquisition/6. Emailer's (NEOBiz) EGYPT/Arabic/01-case-creation` | بريد إنشاء الطلب بالعربية يؤكد بدء الطلب | أول بريد — رقم الطلب يصل العميل قبل أن يعرف أنه سيحتاجه. |
| 9 | (نفس السطر) | `…/Arabic/06-exception-raised-from-governance-partner-name` | بريد استثناء بالعربية يذكر اسم الشريك المعني بالاستفسار | النسخة التي تسمّي الشريك — لأن «ينقص مستند» ليست تعليمة يمكن لأحد أن يتصرف بناءً عليها. |
| 10 | أي أن لا شيء في هذه الرحلة يسقط في صمت دون أن يُنبَّه العميل. | `…/Arabic/03-case-termination-alert-before-submission` | بريد إنذار بالعربية يسبق إنهاء الطلب لعدم النشاط | الإنذار الذي يسبق الإغلاق — لا شيء يسقط في صمت، والعميل يُخبَر مرتين قبل أن ينتهي شيء. |
| 11 | (نفس السطر) | `…/Arabic/07-reminder-on-raised-exception-by-governance-governance` | بريد تذكير بالعربية باستثناء ما زال ينتظر رد العميل | التذكير بسؤال مفتوح — المكالمة التي كانت تعتمد على أن يتذكرها أحد. |
| 12 | فإن أتمّه، تُمسح بيانات العميل ويستطيع البدء بطلب جديد من الصفر. | `…/Arabic/Customer portal/51-withdrawal-survey-reason-selected` | استبيان الانسحاب بالعربية وقد اختار العميل سببًا | المخرج، مبنيًا كما يجب — مساحة للسؤال عن السبب، واحتكاك يكفي ليصير رد الفعل قرارًا. |
| 13 | (نفس السطر) | `…/Arabic/Customer portal/54-application-withdrawn-success` | شاشة تأكيد بالعربية بعد سحب الطلب | الباب، وقد وُجد. من يريد الخروج ولا يستطيع يبقى في النظام سجلًا معلقًا. |
| 14 | …والعميل توقف عن الانتظار دون أن يعرف شيئًا عما يجري. | `…/Arabic/Customer portal/57-group-app-overview-with-queries` | النظرة العامة وقائمة الاستفسارات معًا بالعربية | القناة كلها في إطار واحد — الطريق، والأسئلة على طوله. ولم يكن أي منهما موجودًا قبل ذلك. |

---

# 4 · الفصل الرابع — Fulfilment & AOF

> الرحلتان 4 و5 إنجليزيتان فقط. **نفس المعرّفات في الصفحتين.**

## الصفحة الإنجليزية · 15 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | It's protecting the bank's own compliance record from the possibility of a shortcut. | `Egypt Acquisition/4. BB Egypt - Fulfilment/application details screen/03-otp-verification-empty` | OTP verification screen awaiting a code sent to the customer's registered mobile | The same OTP as everywhere else, doing a different job — it is not verifying who the customer is. It is proving the officer is standing in front of them. |
| 2 | (نفس السطر) | `…/application details screen/06-otp-verification-locked-out` | OTP verification screen in the locked-out state after repeated failed attempts | And what happens when the proof fails — the shortcut has to be closed for the control to mean anything. |
| 3 | A team lead sees their own queue… and a `Reassign` control on every card. | `…/Dashboard/07-officer-dashboard-scheduled-appointments` | Field officer dashboard listing scheduled appointments and completed visits | What the officer sees — a day of appointments, each one a room they have to be in. |
| 4 | (نفس السطر) | `…/Dashboard/10-team-lead-dashboard-my-queue` | Team lead dashboard showing their own queue with a reassign control on each card | What the team lead sees — the same work, plus the authority to move it. |
| 5 | The system lets the work follow the map rather than the org structure. | `…/Dashboard - Utilites/12-team-lead-dashboard-other-queue-view` | Team lead viewing another team's queue | Looking across the gap — cross-team visibility, because the failure it solves is cross-team. |
| 6 | (نفس السطر) | `…/Dashboard - Utilites/16-modal-reassign-cairo-queue-officer-selection` | Reassignment modal selecting an officer from the Cairo queue | Mohandessin is in Giza and closer to Cairo — the work follows the map, not the org chart. |
| 7 | The officer can call from inside the application… and record call feedback afterwards. | `…/application details screen/24-modal-take-action-full-options` | Take action menu listing all six outcomes available to the field officer | One button became six — every way a visit can actually end, named and recordable. |
| 8 | (نفس السطر) | `…/application details screen/28-phone-call-connecting` | In-app call screen connecting to the customer over the device SIM | The call, placed from inside the application — an ordinary phone call that leaves a record behind it. |
| 9 | (نفس السطر) | `…/application details screen/30-modal-ask-to-reschedule` | Reschedule modal for moving an appointment to a new date | Rescheduling as a recorded event, not a gap in the timeline. |
| 10 | The audit history records every state — assigned, pending, rescheduled, rejected — with a written reason. | `…/application details screen/29-modal-call-feedback` | Call feedback modal recording the outcome of a call to the customer | Why nine days were nine days — the cause, captured at the moment it happens rather than reconstructed later. |
| 11 | Everything captured lands against the application immediately. | `…/Application/33-application-documents-pending-verification` | Application documents awaiting verification against the originals | The verification list — the officer holds the original beside the copy already on the system. Collection became confirmation. |
| 12 | (نفس السطر) | `…/Application/36-application-documents-multi-signatory-with-signatures` | Application documents for multiple signatories with captured signatures attached | Signatures captured against each named owner — physical and digital from the moment the pen leaves the paper. |
| 13 | The signature exists physically and digitally, from the moment it's made. | `Egypt Acquisition/5. AOF (Account Opening Form) EGY/Pages/01-cover-page` | Cover page of the generated account opening form | The form the customer used to fill by hand, now generated from data they already gave — the same eighteen pages, none of them re-typed. |
| 14 | (نفس السطر) | `…/Pages/05-ownership-details-shareholders-2-and-3` | Generated form page carrying ownership details for the second and third shareholders | Where the multi-partner constraint lands on paper — the page repeats once per owner, and each one signs their own. |
| 15 | (نفس السطر) | `…/Pages/13-terms-and-conditions-digital-consent-form` | Generated form page carrying the terms and digital consent declaration | The consent the customer read on screen, printed in the language they read it in — the accessibility argument, carried through to the paper. |
| 16 | …it would have made the six-branch constraint worse rather than better. | `…/application details - Utilites/23-application-details-partners` | Application details showing multiple partners, each with their own verification state | Every owner tracked separately — which is what lets a visit be partial without being failed. |

## الصفحة العربية · 15 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | بل تحمي سجل الامتثال لدى البنك من احتمال أن يختصر أحد موظفيه الطريق. | `…/application details screen/03-otp-verification-empty` | شاشة التحقق برمز OTP المُرسل إلى محمول العميل المسجل | الرمز نفسه المستخدم في كل موضع، يؤدي هنا وظيفة أخرى — ليس ليتحقق من هوية العميل، بل ليثبت أن الموظف واقف أمامه. |
| 2 | (نفس السطر) | `…/application details screen/06-otp-verification-locked-out` | شاشة التحقق في حالة الإيقاف بعد تكرار المحاولات الفاشلة | وما يحدث حين يفشل الإثبات — إغلاق الطريق المختصر هو ما يعطي الضابط معناه. |
| 3 | أما قائد الفريق فيرى طابوره، والمكتمل، وطوابير الفرق الأخرى، ومعها زر إعادة إسناد على كل بطاقة. | `…/Dashboard/07-officer-dashboard-scheduled-appointments` | لوحة الموظف الميداني تعرض المواعيد المجدولة والزيارات المكتملة | ما يراه الموظف — يوم من المواعيد، كل موعد منها غرفة عليه أن يكون فيها. |
| 4 | (نفس السطر) | `…/Dashboard/10-team-lead-dashboard-my-queue` | لوحة قائد الفريق تعرض طابوره وزر إعادة الإسناد على كل بطاقة | وما يراه قائد الفريق — العمل نفسه، ومعه صلاحية تحريكه. |
| 5 | أي أن العمل يتبع الخريطة الحقيقية لا الهيكل الإداري. | `…/Dashboard - Utilites/12-team-lead-dashboard-other-queue-view` | قائد فريق يطلع على طابور فريق آخر | النظر عبر الفجوة — صلاحية عابرة للفرق، لأن المشكلة التي تحلها عابرة للفرق. |
| 6 | (نفس السطر) | `…/Dashboard - Utilites/16-modal-reassign-cairo-queue-officer-selection` | نافذة إعادة الإسناد واختيار موظف من طابور القاهرة | المهندسين تتبع الجيزة وأقرب للقاهرة — فالعمل يتبع الخريطة، لا التقسيم الإداري. |
| 7 | …وتسجيل ملاحظات المكالمة بعدها. | `…/application details screen/24-modal-take-action-full-options` | قائمة «اتخذ إجراء» تعرض المخارج الستة المتاحة للموظف الميداني | زر واحد صار ستة — كل طريقة يمكن أن تنتهي بها زيارة فعلًا، مسمّاة وقابلة للتسجيل. |
| 8 | (نفس السطر) | `…/application details screen/28-phone-call-connecting` | شاشة اتصال داخل التطبيق تتصل بالعميل عبر شريحة الجهاز | المكالمة، من داخل الطلب — مكالمة عادية تترك أثرًا خلفها. |
| 9 | (نفس السطر) | `…/application details screen/30-modal-ask-to-reschedule` | نافذة إعادة جدولة الموعد إلى تاريخ جديد | إعادة الجدولة كواقعة مسجلة، لا كفجوة في الزمن. |
| 10 | وسجل التدقيق يحفظ كل حالة بسبب مكتوب. | `…/application details screen/29-modal-call-feedback` | نافذة تسجيل ملاحظات المكالمة مع العميل | لماذا كانت التسعة أيام تسعة — السبب ملتقط لحظة حدوثه لا معاد بناؤه لاحقًا. |
| 11 | وكل ما يلتقطه يستقر في الطلب فورًا. | `…/Application/33-application-documents-pending-verification` | مستندات الطلب في انتظار مطابقتها بالأصول | قائمة التحقق — الموظف يمسك الأصل بجوار النسخة المرفوعة. الجمع صار تأكيدًا. |
| 12 | (نفس السطر) | `…/Application/36-application-documents-multi-signatory-with-signatures` | مستندات الطلب لعدة موقّعين مع التوقيعات الملتقطة | توقيع ملتقط مقابل كل مالك باسمه — مادي ورقمي منذ لحظة رفع القلم. |
| 13 | فيصير التوقيع موجودًا ماديًا ورقميًا معًا، منذ لحظة حدوثه. | `Egypt Acquisition/5. AOF (Account Opening Form) EGY/Pages/01-cover-page` | غلاف نموذج فتح الحساب المولَّد | النموذج الذي كان العميل يملؤه بيده، مولّدًا من بيانات أعطاها بالفعل — الثماني عشرة صفحة نفسها، ولا واحدة منها أُعيد إدخالها. |
| 14 | (نفس السطر) | `…/Pages/05-ownership-details-shareholders-2-and-3` | صفحة مولّدة تحمل بيانات ملكية المساهمين الثاني والثالث | حيث يقع قيد تعدد الشركاء على الورق — الصفحة تتكرر مرة لكل مالك، ويوقّع كل واحد صفحته. |
| 15 | (نفس السطر) | `…/Pages/13-terms-and-conditions-digital-consent-form` | صفحة مولّدة تحمل الشروط وإقرار الموافقة الرقمية | الموافقة التي قرأها العميل على الشاشة، مطبوعة باللغة التي قرأها بها — حجة قابلية الوصول والاستخدام، ممتدة إلى الورق. |
| 16 | وكان سيزيد قيد الفروع الستة سوءًا بدل أن يخففه. | `…/application details - Utilites/23-application-details-partners` | تفاصيل الطلب تعرض عدة شركاء، لكل منهم حالة تحقق مستقلة | كل مالك متتبّع على حدة — وهذا ما يجعل الزيارة جزئية دون أن تكون فاشلة. |

---

# 5 · صفحة قابلية الوصول والاستخدام

> بنية الأزواج: كل حجة تكافؤ أخذت **وسمين متجاورين** — إنجليزي ثم عربي من الحالة نفسها.

## الصفحة الإنجليزية · 16 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | Parity extends to every state — filled, empty, error, multi-entry — not to a selected set of hero screens. | `Egypt Acquisition/1. Onboarding Journey/English/Company details/company-details-error` | Company details form in its error state, left-to-right | The error state, left-to-right — the state most often left behind in a bilingual build. |
| 2 | (زوج) | `…/Arabic/Company details/company-profile-arabic-error` | The same company details error state in Arabic, mirrored right-to-left | And its counterpart. Parity is claimed across every state, so the proof has to be an error screen rather than a hero screen. |
| 3 | (زوج) | `Egypt Acquisition/3. NEO BIZ…/English/Customer portal/46-pending-queries-empty-state` | Customer portal pending queries tab in its empty state, left-to-right | Parity is not confined to the application form — the portal mirrors too. |
| 4 | (زوج) | `…/Arabic/Customer portal/46-pending-queries-empty-state` | The same portal empty state in Arabic, mirrored right-to-left | Same screen, opposite direction — the tab bar, the counts, and the empty illustration all reverse together. |
| 5 | The same behaviour was reported again after the controlled release. | `…/English/Regulatory declaration/PEP declarations/modal-pep-definition-english` | Modal defining a politically exposed person, in English | The explanation in English — where half the participants started. |
| 6 | (زوج) | `…/Arabic/Regulatory declaration/PEP declarations/pep-info-modal-arabic` | The same PEP definition modal in Arabic | And where nearly all of them ended up, at exactly this step. Switched in place, without losing position. |
| 7 | …terminology rewritten for comprehension rather than reproduced from the compliance form. | `…/English/Regulatory declaration/Sanction/modal-completion-details-english` | Modal explaining what the sanctions declaration requires, in plain English | Explanation at the point of the question — not a help centre the customer has to leave the form to find. |
| 8 | (نفس السطر) | `Egypt Acquisition/5. AOF…/Pages/13-terms-and-conditions-digital-consent-form` | Generated account opening form page carrying the terms and digital consent declaration | Where the argument has to hold at the end: the consent the customer read on screen, printed in the language they read it in. |
| 9 | …the ones a stressed customer is most likely to meet. | `…/English/Company details/operational-details-international-branches-and-error` | Operational details form showing a validation error alongside international branch entries | Three signals, never colour alone — a banner that scrolls to the fault, the field outlined, and a description saying exactly what is required. |
| 10 | (زوج) | `…/Arabic/Company details/operational-details-arabic-error` | The same operational details error state in Arabic, mirrored | The same three signals in Arabic — including the banner's scroll direction, which is the part that quietly breaks in most mirrored builds. |
| 11 | It is also the single largest decision for reducing journey time — one decision serving both goals. | `…/English/Company details/company-details-partially-pre-populated` | Company details form partly pre-populated from an uploaded document, with the remaining fields empty | Confirming instead of typing — what the OCR read is already in place, and what it could not read is the only thing left to enter. |
| 12 | (زوج) | `…/Arabic/Company details/company-upload-arabic-all-documents-uploaded` | Document upload screen in Arabic with all company documents uploaded | The step that replaces the keyboard — the customer supplies documents, and the fields fill themselves. |
| 13 | …so returning does not mean restarting. | `…/English/Pre-Submit/Review/review-collapsed` | Review screen with all stages collapsed into separate editable sections | Why seven of ten could leave and come back — five stages held separately, each one editable on its own. |
| 14 | (زوج) | `…/Arabic/Pre-Submit/Review/review-arabic` | The same collapsed review structure in Arabic | Returning is not restarting — in either direction. |
| 15 | …which the system team reviewed and absorbed. | `…/English/Post-Submit/Scheduling visit/application-submitted-visit-selected` | Meeting-location selection card in English, choosing where the verification visit happens | The meeting-location card — one of the components that went back into the shared library. |
| 16 | (زوج) | `…/Arabic/Post-Submit/Scheduling visit/application-submitted-arabic-verification-choice` | The same meeting-location selection card in Arabic, mirrored | And its RTL variant. This is what "landing in the shared layer" means — the next team gets it without asking. |
| 17 | …each practice, the WCAG criterion it maps to, and how it was verified. | `Egypt Acquisition/4. BB Egypt - Fulfilment/application details screen/03-otp-verification-empty` | OTP entry screen with the code split across separate boxes | OTP in separate boxes with paste fully allowed — 3.3.8 Accessible Authentication, the WCAG 2.2 criterion banks fail most often. |
| 18 | Everything I built was an attempt to replace what they were quietly doing. | `Egypt Acquisition/5. AOF…/Pages/07-regulatory-declaration-fatca-and-pep` | Paper account opening form, regulatory declaration page for FATCA and politically exposed persons | The page the officer used to read aloud, interpret, and answer on the customer's behalf. Everything in this document is an attempt to replace that. |

## الصفحة العربية · 16 وسماً

| # | السطر السابق للصورة | Public ID | Alt | Caption |
|---|---|---|---|---|
| 1 | …هو ما جعل تبديل اللغة رخيص التكلفة بما يكفي ليُقبل. | `…/English/Company details/company-details-error` | نموذج بيانات الشركة في حالة الخطأ، من اليسار إلى اليمين | حالة الخطأ بالإنجليزية — وهي أول ما يُهمَل في أي بناء ثنائي اللغة. |
| 2 | (زوج) | `…/Arabic/Company details/company-profile-arabic-error` | نفس حالة الخطأ بالعربية، منعكسة من اليمين إلى اليسار | ونظيرتها. التكافؤ مُدّعى في كل حالة، فالدليل لازم أن يكون شاشة خطأ لا شاشة بطولية. |
| 3 | (زوج) | `…/English/Customer portal/46-pending-queries-empty-state` | تبويب الاستفسارات المعلقة في حالته الفارغة بالإنجليزية | والتكافؤ لا يقتصر على نموذج الطلب — البوابة تنعكس أيضًا. |
| 4 | (زوج) | `…/Arabic/Customer portal/46-pending-queries-empty-state` | نفس الحالة الفارغة بالعربية، منعكسة | الشاشة نفسها باتجاه معاكس — شريط التبويب والأعداد والرسم تنعكس معًا. |
| 5 | وتكرر السلوك نفسه بعد الإطلاق المحدود. | `…/English/Regulatory declaration/PEP declarations/modal-pep-definition-english` | نافذة تعرّف بالشخص المعرّض سياسيًا بالإنجليزية | الشرح بالإنجليزية — حيث بدأ نصف المشاركين. |
| 6 | (زوج) | `…/Arabic/Regulatory declaration/PEP declarations/pep-info-modal-arabic` | نفس النافذة بالعربية | وحيث انتهى جلّهم، عند هذه الخطوة بالذات. يُبدّل في موضعه دون فقدان المكان. |
| 7 | …وصياغة أُعيدت كتابتها للفهم بدل نسخها من نموذج الامتثال كما هي. | `…/Arabic/Regulatory declaration/Sanction/modal-completion-details-arabic` | نافذة بالعربية تشرح ما يتطلبه إقرار العقوبات | الشرح عند موضع السؤال — لا في مركز مساعدة يضطر العميل لمغادرة النموذج ليجده. |
| 8 | (نفس السطر) | `Egypt Acquisition/5. AOF…/Pages/13-terms-and-conditions-digital-consent-form` | صفحة مولّدة من نموذج فتح الحساب تحمل الشروط وإقرار الموافقة الرقمية | حيث يجب أن تصمد الحجة في النهاية: الموافقة التي قرأها العميل على الشاشة، مطبوعة باللغة التي قرأها بها. |
| 9 | …وهي في الوقت نفسه أول ما يواجهه عميل متوتر. | `…/English/Company details/operational-details-international-branches-and-error` | نموذج التفاصيل التشغيلية يعرض خطأ تحقق بالإنجليزية | ثلاث إشارات ولا يُعتمد على اللون وحده — شريط ينقل إلى الحقل، وإطار أحمر، ووصف يقول ما المطلوب بالضبط. |
| 10 | (زوج) | `…/Arabic/Company details/operational-details-arabic-error` | نفس حالة الخطأ التشغيلية بالعربية، منعكسة | الإشارات الثلاث نفسها بالعربية — بما فيها اتجاه تمرير الشريط، وهو الجزء الذي ينكسر بصمت في أغلب البناءات المنعكسة. |
| 11 | أي أن القرار الواحد خدم الهدفين. | `…/English/Company details/company-details-partially-pre-populated` | نموذج بيانات الشركة مُعبّأ جزئيًا من مستند مرفوع، وبقية الحقول فارغة | التأكيد بدل الكتابة — ما قرأه الـ OCR موجود بالفعل، وما عجز عنه هو وحده ما يتبقى. |
| 12 | (زوج) | `…/Arabic/Company details/company-upload-arabic-all-documents-uploaded` | شاشة رفع المستندات بالعربية وقد رُفعت كل مستندات الشركة | الخطوة التي تحل محل لوحة المفاتيح — العميل يقدم مستندات، والحقول تملأ نفسها. |
| 13 | …والعودة إليها لا تعني البدء من جديد. | `…/English/Pre-Submit/Review/review-collapsed` | شاشة المراجعة ومراحلها مطوية في أقسام منفصلة قابلة للتعديل | لماذا استطاع سبعة من عشرة أن يتركوا ويعودوا — خمس مراحل محفوظة منفصلة، كل واحدة تُعدّل وحدها. |
| 14 | (زوج) | `…/Arabic/Pre-Submit/Review/review-arabic` | نفس بنية المراجعة المطوية بالعربية | العودة ليست بدءًا من جديد — في الاتجاهين معًا. |
| 15 | …راجعها فريق النظام واستوعبها ضمن المكتبة المشتركة. | `…/English/Post-Submit/Scheduling visit/application-submitted-visit-selected` | بطاقة اختيار مكان اللقاء بالإنجليزية | بطاقة مكان اللقاء — أحد المكونات التي عادت إلى المكتبة المشتركة. |
| 16 | (زوج) | `…/Arabic/Post-Submit/Scheduling visit/application-submitted-arabic-verification-choice` | نفس البطاقة بالعربية، منعكسة | ومتغيرها باتجاه RTL. وهذا معنى أن يحطّ المكسب في الطبقة المشتركة — الفريق التالي يجده دون أن يطلبه. |
| 17 | وهذا السجل الأمين لما جرى: | `Egypt Acquisition/4. BB Egypt - Fulfilment/application details screen/03-otp-verification-empty` | شاشة إدخال رمز OTP في خانات منفصلة | رمز OTP في خانات منفصلة واللصق مسموح بالكامل — معيار 3.3.8 في WCAG 2.2، وهو أكثر ما تسقط فيه البنوك. |
| 18 | …دون أن يسميه أحد قابلية وصول واستخدام. | `Egypt Acquisition/5. AOF…/Pages/07-regulatory-declaration-fatca-and-pep` | صفحة الإقرار التنظيمي الورقية لـ FATCA والأشخاص المعرّضين سياسيًا | الصفحة التي كان الموظف يقرأها بصوت عالٍ ويفسرها ويجيب عنها نيابةً عن العميل. وكل ما في هذه الصفحة محاولة لإحلال ذلك. |

---

# ملخص

| الصفحة | EN | AR |
|---|---|---|
| الفصل الأول · Onboarding | 16 | 16 |
| الفصل الثاني · Application Workflow | 10 | 10 |
| الفصل الثالث · Customer Portal | 13 | 13 |
| الفصل الرابع · Fulfilment & AOF | 15 | 15 |
| قابلية الوصول والاستخدام | 16 | 16 |
| **الإجمالي** | **70** | **70** |
