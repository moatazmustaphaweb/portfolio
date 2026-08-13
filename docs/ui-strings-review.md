# docs/ui-strings-review.md — Arabic UI String Review

> **Generated** by `npm run export:ui-strings` from the live database.
> Do not hand-edit: apply corrections to the database, then regenerate.
> Reviewed 2026-08-11 (52 strings) and 2026-08-13 (the 11 added since).
> Verified drift-free by `npm run check:seed-drift`.

Every interface word on the site. No component may contain a user-facing
literal — these are the strings they resolve instead (rule 1).

**Register target:** modern professional Arabic — the tone of a well-made Gulf
banking product. Not classical/newspaper, not casual.

**Convention:** technical and brand terms (Governance, Compliance, OTP, OCR,
RTL, KYC, NDA, LinkedIn) stay in English inside Arabic text rather than being
forced into Arabic equivalents.

---

## Review status

**Reviewed and corrected 2026-08-11.** Nine strings changed; the two collisions
and the NDA convention breach were the real bugs.

| Key | Was | Now | Why |
|---|---|---|---|
| `objective` | الهدف | **الغاية** | Collided with `target` |
| `outcome` | النتيجة | **الحصيلة** | Collided with `result` |
| `redacted_notice` | …اتفاقية سرية | **محجوب بموجب NDA** | Technical terms stay Latin |
| `reflection` | تأمّل | **خلاصة** | Read contemplative, not professional |
| `status_projected` | متوقّع | **تقديري** | متوقّع reads "expected" — over-claims against decision 007 |
| `status_achieved` | تحقّق | **محقَّق** | Adjective, not verb, in a status chip |
| `status_missed` | لم يتحقّق | **غير محقَّق** | Adjective, not verb |
| `skip_to_content` | تخطَّ إلى المحتوى | **انتقل إلى المحتوى** | Diacritic unusual in UI |
| `case_file` | ملف حالة | **ملف المشروع** | Read clinical/legal |

Verified after applying: **no Arabic value serves more than one key, and no
English value serves more than one key**, across all 52.

### Second pass — 2026-08-13, the eleven added after the first

**Why there was a second pass.** The first pass covered the 52 strings that
existed on 2026-08-11. Eleven more were written straight to the database on
2026-08-12 — after the review, and into no migration file. This document
carried on saying "Reviewed and corrected 2026-08-11" over a table that had
grown to 84 rows, so the eleven read as reviewed when nothing had looked at
them. That header is why they slipped, and it is why it now names both dates
and both counts.

| Key | Was | Now | Why |
|---|---|---|---|
| `sibling_case_files` | ملفات شقيقة | **ملفات مرتبطة** | شقيقة is a literal *sibling* and reads biological; مرتبطة states the actual relationship |
| `form_subject_speaking` | مشاركة أو كتابة | **ندوة أو مقال** | The English means being invited to speak or to write. مشاركة reads *participation*, so someone wanting to invite him to a panel would not recognise the option |

**`status_label` — الحالة, examined and KEPT.** The flagged risk was a
collision with the `status_*` values in the column beneath it. There is none:
those are محقَّق / غير محقَّق / غير قابل للقياس, all adjectives, while الحالة is a
column heading. The only collision that ever existed was with `case_file`, and
it was resolved when that became ملف المشروع. الحالة is the standard term for
Status in Gulf product interfaces, which is the register target above.
**Settled — not to be re-raised.**

The remaining eight are approved as written.

> 🔴 **One of the eleven is still unreviewed: `form_message_placeholder`.**
> It is the string every enumeration missed. Each list was written as
> `form_subject*` plus five named keys — which covers ten. This one begins
> `form_` but not `form_subject`, so the glob stepped over it and it was
> counted as reviewed without being read. Its flag stays until it is.

### Kept as-is

`form_email` and `read_linear` are correct Arabic. Their length is a layout
problem, not a translation problem.

### Open — layout, not language

Handled in CSS rather than by shortening Arabic:

- **Submit button** needs a `min-width` so `form_submit` → `form_sending`
  (إرسال → جارٍ الإرسال…) cannot resize the button mid-interaction.
- **Status pills** need a shared `min-width` so محقَّق / غير محقَّق /
  غير قابل للقياس do not vary against each other down a table column.

Both are tokens in `docs/design/tokens.md`; the components that consume them
are Phase 1.

### Privacy and consent copy — added 2026-08-11, needs review

These eight are new. The four privacy claims are not ordinary interface copy: they are the site's honesty statement, and they are what an Arabic-speaking recruiter or curator reads before deciding whether to trust anything else. Flagging where I was least confident:

1. **`privacy_no_tracking` — "I cannot follow you between visits."** The hardest to state naturally. My rendering is **`لا أستطيع تتبّعك بين الزيارات.`** The problem is `تتبّع` — it carries a surveillance connotation closer to "stalk/trace" than the neutral technical "track", so the sentence can read as protesting too much, almost defensive. Alternatives worth weighing: `لا يمكنني التعرّف عليك عند عودتك` ("I can't recognise you when you return") — softer and arguably more accurate to what actually happens, since the mechanism is that the session id dies with the tab. Your call which is more honest and less loaded.

2. **`privacy_no_ip` — "I never store IP addresses."** Rendered **`لا أخزّن عناوين IP إطلاقاً.`** IP stays Latin per the convention. `إطلاقاً` is doing the work of "never" emphatically; check it does not tip into overclaiming.

3. **`privacy_location` — "I record approximate location — country and city."** Rendered **`أسجّل الموقع التقريبي — الدولة والمدينة.`** Straightforward, but `أسجّل` ("I record/register") could also be read as "I register" in a bureaucratic sense.

4. **`privacy_ga`** and **`consent_message`** both name Google Analytics in Latin, which follows the convention. `consent_message` is the longest string in the set — worth checking it does not wrap awkwardly in the banner at mobile width.

5. **`consent_accept` / `consent_decline`** — `أوافق` / `لا شكراً`. Decision 030 requires decline to read as no harder a choice than accept. `لا شكراً` is polite and natural; confirm it does not read as *more* hesitant than `أوافق` is affirmative, which would be a soft dark pattern in the opposite direction from the usual one.

### Not bugs

`lang_en` is "English" and `lang_ar` is "العربية" in **both** locales — each
language is labelled in its own script so the switch is legible whichever
locale you are in.

---

## The strings

| key | English | Arabic | Flag |
|---|---|---|---|
| `all` | All | الكل |  |
| `back_to_work` | Back to work | العودة إلى الأعمال |  |
| `breadcrumb_label` | Breadcrumb | مسار التنقل |  |
| `case_file` | Case file | ملف المشروع | ✅ Corrected — `ملف المشروع` |
| `chapter` | Chapter | الفصل |  |
| `chapter_of` | Chapter {current} of {total} | الفصل {current} من {total} |  |
| `consent_accept` | Allow | أوافق | ⚠️ Review — must read as clearly as the decline |
| `consent_decline` | No thanks | لا أوافق | ⚠️ Review — must not read as softer than accept |
| `consent_message` | I use Google Analytics to see which countries my work reaches. It sets cookies. You can say no. | أستخدم Google Analytics لأعرف الدول التي تصل إليها أعمالي. يضع ملفات تعريف الارتباط. يمكنك الرفض. | ⚠️ Review — longest string; also check banner width |
| `context` | Context | السياق |  |
| `cv` | CV | السيرة الذاتية |  |
| `decision` | Decision | القرار |  |
| `domain_ai` | AI | الذكاء الاصطناعي |  |
| `domain_banking` | Banking | الخدمات المصرفية |  |
| `domain_branding` | Branding | الهوية |  |
| `domain_smart_things` | Smart Things | الأنظمة الذكية |  |
| `download_cv` | Download CV | تحميل السيرة الذاتية |  |
| `entry_handles_heading` | Three ways in | ثلاث طرق للدخول |  |
| `error_cta` | Try again | حاول مرة أخرى |  |
| `error_title` | Something went wrong | حدث خطأ ما |  |
| `evidence` | Evidence | الدليل |  |
| `filter_by` | Filter by | تصفية حسب |  |
| `filter_domain` | Domain | المجال |  |
| `form_email` | Email | البريد الإلكتروني | Kept — correct Arabic; length is a layout problem, handled in CSS |
| `form_error` | That didn’t send. Try again, or email me directly. | لم يتم الإرسال. حاول مرة أخرى، أو راسلني مباشرة. |  |
| `form_message` | Message | الرسالة |  |
| `form_message_placeholder` | The more context you give, the more useful my first reply will be. | كلما أعطيتني سياقاً أوضح، كان ردّي الأول أكثر فائدة. | 🔴 Not reviewed — the eleventh string, and the one every enumeration missed. Longest of the set, and it sets the tone of the contact form |
| `form_name` | Name | الاسم |  |
| `form_required` | This field is required. | هذا الحقل مطلوب. |  |
| `form_sending` | Sending… | جارٍ الإرسال… | ⚠️ Layout — submit button needs a min-width so it cannot resize mid-interaction |
| `form_subject` | What's this about? | عن ماذا تودّ الحديث؟ |  |
| `form_subject_hiring` | Hiring | توظيف |  |
| `form_subject_other` | Something else | شيء آخر |  |
| `form_subject_project` | A project | مشروع |  |
| `form_subject_speaking` | Speaking or writing | ندوة أو مقال | Reviewed 2026-08-13 — was `مشاركة أو كتابة`, which reads *participation*. `ندوة أو مقال` names the two real occasions: a panel, or a piece |
| `form_submit` | Send | إرسال | ⚠️ Layout — see `form_sending` |
| `form_success` | Thanks — I’ll reply soon. | شكراً — سأردّ قريباً. |  |
| `home` | Home | الرئيسية |  |
| `lang_ar` | العربية | العربية | By design — labelled in its own script in both locales |
| `lang_en` | English | English | By design — labelled in its own script in both locales |
| `language` | Language | اللغة |  |
| `linear_view` | Read start to finish | اقرأ من البداية إلى النهاية |  |
| `linkedin` | LinkedIn | LinkedIn | Brand name — stays Latin in Arabic |
| `nda_label` | Under NDA | تحت اتفاقية سرية |  |
| `next_chapter` | Next chapter | الفصل التالي |  |
| `no_results` | Nothing matches that filter yet. | لا يوجد ما يطابق هذه التصفية بعد. |  |
| `not_found_body` | The link may be out of date. The work is all still here. | قد يكون الرابط قديماً. جميع الأعمال ما زالت هنا. |  |
| `not_found_cta` | Go to the work | اذهب إلى الأعمال |  |
| `not_found_title` | That page doesn’t exist | هذه الصفحة غير موجودة |  |
| `objective` | Objective | الغاية | ✅ Corrected — `الغاية`, freeing `الهدف` for `target` |
| `outcome` | Outcome | الحصيلة | ✅ Corrected — `الحصيلة`, freeing `النتيجة` for `result` |
| `page_about` | About | عن مُعتز |  |
| `page_contact` | Contact | تواصل |  |
| `page_philosophy` | Philosophy | الفلسفة |  |
| `page_systems` | Systems | الأنظمة |  |
| `page_work` | Work | الأعمال |  |
| `previous_chapter` | Previous chapter | الفصل السابق |  |
| `privacy_ga` | I use Google Analytics only if you allow it, and you can decline. | أستخدم Google Analytics فقط إذا سمحت بذلك، ويمكنك الرفض. | ⚠️ Review — register |
| `privacy_location` | I record approximate location — country and city. | أسجّل الموقع التقريبي — الدولة والمدينة. | ⚠️ Review — register |
| `privacy_no_ip` | I never store IP addresses. | لا أخزّن عناوين IP. | ⚠️ Review — `عناوين IP` keeps IP Latin per convention |
| `privacy_no_tracking` | I cannot follow you between visits. | لا يمكنني التعرّف عليك عند عودتك. | 🔴 **Hardest to state naturally** — see notes above |
| `privacy_title` | What this site records | ما الذي يسجّله هذا الموقع | ⚠️ Review — heading register |
| `read_linear` | Read start to finish | اقرأ من البداية إلى النهاية | Kept — correct Arabic; length is a layout problem |
| `read_more` | Read more | اقرأ المزيد |  |
| `redacted_notice` | Redacted under NDA | محجوب بموجب NDA | ✅ Corrected — NDA now stays Latin |
| `reflection` | Reflection | خلاصة | ✅ Corrected — `خلاصة` |
| `result` | Result | النتيجة |  |
| `results` | Results | النتائج |  |
| `results_table` | Results table | جدول النتائج |  |
| `role_label` | Role | الدور |  |
| `sibling_case_files` | Sibling case files | ملفات مرتبطة | Reviewed 2026-08-13 — was `ملفات شقيقة`, a literal *sibling* that reads biological. `ملفات مرتبطة` states the relationship |
| `skip_to_content` | Skip to content | انتقل إلى المحتوى | ✅ Corrected — no diacritic |
| `status_achieved` | Achieved | محقَّق | ✅ Corrected — adjective form |
| `status_label` | Status | الحالة | Reviewed 2026-08-13 — `الحالة` KEPT. No collision with the `status_*` values below it: those are adjectives (محقَّق / غير محقَّق / غير قابل للقياس), this is a column heading. The only real collision was `case_file`, resolved when it became ملف المشروع. Standard for Status in Gulf product interfaces. Settled |
| `status_missed` | Missed | غير محقَّق | ✅ Corrected — adjective form |
| `status_not_measurable` | Not measurable | غير قابل للقياس | ⚠️ Layout — status pills need a shared min-width |
| `status_projected` | Projected | تقديري | ✅ Corrected — `تقديري`; `متوقّع` over-claimed against decision 007 |
| `stub_in_progress` | This page is being built. The structure is in place; the writing is not. | هذه الصفحة قيد الإنشاء. البنية جاهزة، أمّا المحتوى فلا. |  |
| `target` | Target | الهدف |  |
| `theme_dark` | Dark | داكن |  |
| `theme_light` | Light | فاتح |  |
| `theme_system` | System | تلقائي | Approved 2026-08-13 — `تلقائي` describes the behaviour, not the device |
| `theme_toggle` | Toggle theme | تبديل المظهر |  |
| `view_all` | View all | عرض الكل |  |
---

**84 strings.** Every one present in both locales.

To apply corrections: update the database, then re-run
`npm run export:ui-strings` so this document stays true. The seed migration
`supabase/migrations/0003_seed_site_chrome.sql` must be updated to match, or
a rebuild from scratch will reintroduce the old strings.
