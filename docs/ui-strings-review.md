# docs/ui-strings-review.md — Arabic UI String Review

> **Generated** by `npm run export:ui-strings` from the live database.
> Do not hand-edit: apply corrections to the database, then regenerate.
> Reviewed and corrected 2026-08-11. Verified drift-free by `npm run check:seed-drift`.

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
| `consent_accept` | Allow | أوافق |  |
| `consent_decline` | No thanks | لا شكراً |  |
| `consent_message` | I use Google Analytics to see which countries my work reaches. It sets cookies. You can say no. | أستخدم Google Analytics لأعرف الدول التي تصل إليها أعمالي. يضع ملفات تعريف الارتباط. يمكنك الرفض. |  |
| `context` | Context | السياق |  |
| `cv` | CV | السيرة الذاتية |  |
| `decision` | Decision | القرار |  |
| `error_cta` | Try again | حاول مرة أخرى |  |
| `error_title` | Something went wrong | حدث خطأ ما |  |
| `evidence` | Evidence | الدليل |  |
| `filter_by` | Filter by | تصفية حسب |  |
| `filter_domain` | Domain | المجال |  |
| `form_email` | Email | البريد الإلكتروني | Kept — correct Arabic; length is a layout problem, handled in CSS |
| `form_error` | That didn’t send. Try again, or email me directly. | لم يتم الإرسال. حاول مرة أخرى، أو راسلني مباشرة. |  |
| `form_message` | Message | الرسالة |  |
| `form_name` | Name | الاسم |  |
| `form_required` | This field is required. | هذا الحقل مطلوب. |  |
| `form_sending` | Sending… | جارٍ الإرسال… | ⚠️ Layout — submit button needs a min-width so it cannot resize mid-interaction |
| `form_submit` | Send | إرسال | ⚠️ Layout — see `form_sending` |
| `form_success` | Thanks — I’ll reply soon. | شكراً — سأردّ قريباً. |  |
| `home` | Home | الرئيسية |  |
| `lang_ar` | العربية | العربية | By design — labelled in its own script in both locales |
| `lang_en` | English | English | By design — labelled in its own script in both locales |
| `language` | Language | اللغة |  |
| `linkedin` | LinkedIn | LinkedIn | Brand name — stays Latin in Arabic |
| `next_chapter` | Next chapter | الفصل التالي |  |
| `no_results` | Nothing matches that filter yet. | لا يوجد ما يطابق هذه التصفية بعد. |  |
| `not_found_body` | The link may be out of date. The work is all still here. | قد يكون الرابط قديماً. جميع الأعمال ما زالت هنا. |  |
| `not_found_cta` | Go to the work | اذهب إلى الأعمال |  |
| `not_found_title` | That page doesn’t exist | هذه الصفحة غير موجودة |  |
| `objective` | Objective | الغاية | ✅ Corrected — `الغاية`, freeing `الهدف` for `target` |
| `outcome` | Outcome | الحصيلة | ✅ Corrected — `الحصيلة`, freeing `النتيجة` for `result` |
| `previous_chapter` | Previous chapter | الفصل السابق |  |
| `privacy_ga` | I use Google Analytics only if you allow it, and you can decline. | أستخدم Google Analytics فقط إذا سمحت بذلك، ويمكنك الرفض. |  |
| `privacy_location` | I record approximate location — country and city. | أسجّل الموقع التقريبي — الدولة والمدينة. |  |
| `privacy_no_ip` | I never store IP addresses. | لا أخزّن عناوين IP إطلاقاً. |  |
| `privacy_no_tracking` | I cannot follow you between visits. | لا أستطيع تتبّعك بين الزيارات. |  |
| `privacy_title` | What this site records | ما الذي يسجّله هذا الموقع |  |
| `read_linear` | Read start to finish | اقرأ من البداية إلى النهاية | Kept — correct Arabic; length is a layout problem |
| `read_more` | Read more | اقرأ المزيد |  |
| `redacted_notice` | Redacted under NDA | محجوب بموجب NDA | ✅ Corrected — NDA now stays Latin |
| `reflection` | Reflection | خلاصة | ✅ Corrected — `خلاصة` |
| `result` | Result | النتيجة |  |
| `results` | Results | النتائج |  |
| `role_label` | Role | الدور |  |
| `skip_to_content` | Skip to content | انتقل إلى المحتوى | ✅ Corrected — no diacritic |
| `status_achieved` | Achieved | محقَّق | ✅ Corrected — adjective form |
| `status_missed` | Missed | غير محقَّق | ✅ Corrected — adjective form |
| `status_not_measurable` | Not measurable | غير قابل للقياس | ⚠️ Layout — status pills need a shared min-width |
| `status_projected` | Projected | تقديري | ✅ Corrected — `تقديري`; `متوقّع` over-claimed against decision 007 |
| `target` | Target | الهدف |  |
| `theme_dark` | Dark | داكن |  |
| `theme_light` | Light | فاتح |  |
| `theme_toggle` | Toggle theme | تبديل المظهر |  |
| `view_all` | View all | عرض الكل |  |
---

**60 strings.** Every one present in both locales.

To apply corrections: update the database, then re-run
`npm run export:ui-strings` so this document stays true. The seed migration
`supabase/migrations/0003_seed_site_chrome.sql` must be updated to match, or
a rebuild from scratch will reintroduce the old strings.
