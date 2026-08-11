# docs/status.md — Build Status

**Living document.** Updated at the end of each working session. Newest first.
For the queue, see `TASKS.md`; for why anything is the way it is, `docs/decisions.md`.

---

## 2026-08-11 — Arabic corrections applied · Phase 0 foundation complete

### Arabic review pass — applied

All nine corrections are live in the database, in `supabase/migrations/0003_seed_site_chrome.sql`, and reflected in `docs/ui-strings-review.md`.

| Key | Was | Now |
|---|---|---|
| `objective` | الهدف | **الغاية** |
| `outcome` | النتيجة | **الحصيلة** |
| `redacted_notice` | محجوب بموجب اتفاقية سرية | **محجوب بموجب NDA** |
| `reflection` | تأمّل | **خلاصة** |
| `status_projected` | متوقّع | **تقديري** |
| `status_achieved` | تحقّق | **محقَّق** |
| `status_missed` | لم يتحقّق | **غير محقَّق** |
| `skip_to_content` | تخطَّ إلى المحتوى | **انتقل إلى المحتوى** |
| `case_file` | ملف حالة | **ملف المشروع** |

**Verified, not assumed:**

- **No collisions remain.** A query across all 52 strings confirms no Arabic value serves more than one key, and no English value serves more than one key — in either direction, not just the two that were reported.
- **Rendered end-to-end.** `/ar` serves `انتقل إلى المحتوى` from a clean production build.
- **No file/database drift.** `npm run check:seed-drift` reports 52 = 52.

### Length handled in CSS, not by shortening Arabic

Two tokens added, documented in `docs/design/tokens.md`:

```
--control-min-w: 8rem     /* submit button — fits جارٍ الإرسال… */
--pill-min-w:  7.5rem     /* status pill — fits غير قابل للقياس */
```

Available as `min-w-control` and `min-w-pill`. The components that consume them (Contact form, Results Table) are Phase 1.

> ⚠️ **Provisional values** — estimated from the longest Arabic string in each set, not measured against rendered text. Verify in both locales when those components land.

### New guard against a recurring failure

`npm run check:seed-drift` parses the seed migrations and compares them field by field against the database. It exists because the drift already happened once: transcribing the seed into `apply_migration` silently substituted ASCII for typographic characters, and the committed migration stopped reproducing the live data. Run it after any content change.

---

## Phase 0 — where the foundation stands

| Task | State |
|---|---|
| 0.1 Repo & environment | Mostly — ESLint and Vercel still outstanding |
| 0.2 Supabase schema | ✅ Applied and verified behaviourally |
| 0.3 Seed | ✅ 52 UI strings, 8 nav items, settings (3 values pending) |
| 0.4 Notion sync | Not started — blocked on stale Cervello rows |
| 0.5 Query layer | ✅ Verified, 13/13 |
| 0.6 Design tokens | ✅ Except the redaction treatment (question H) |
| 0.7 i18n + RTL shell | ✅ Except Breadcrumb, deferred to Phase 1 |
| 0.8 Cloudinary + media | **Next** |
| 0.9 Instrumentation | Not started |

### 0.7 was completed in the previous session

`/en` renders `lang=en dir=ltr`, `/ar` renders `lang=ar dir=rtl`, both prerendered as SSG, with header, footer, nav, language switch and theme toggle rendering entirely from Supabase. `/` redirects to `/en`. Verified against a running server, not just a passing build.

The only deferred piece is **Breadcrumb** — there are no nested routes for it to render on until Phase 1.

---

## Blockers, by who owns them

### Launch-gate blockers — Moataz

| Item | Why it blocks launch |
|---|---|
| `settings.tagline` | The line under the name on the landing page — the site's one-sentence claim about itself |
| `settings.og_image` | Controls how every shared link renders on LinkedIn and WhatsApp |
| `settings.cv_url` | The footer CV link is absent until it exists |

### Design decisions — Moataz

| Item | Blocks |
|---|---|
| Redaction treatment (question H) | `RedactedEvidence`, the `redacted` Cloudinary preset. Currently a plain bordered surface — deliberately not elaborated |
| Permanent Arabic typeface (question F) | Geist is an explicit interim (decision 020). The type scale is verified for Latin only |

### Content — Moataz

| Item | Blocks |
|---|---|
| Stale Cervello rows in Notion | Sync script correctness |
| Mini case files — in MVP-1 or cut? | Gallery scope |
| NDA asset audit + redaction rules | Every Evidence block |
| Neobiz Mobile feature lists | 2 chapters |

---

## Verification commands

```bash
npm run verify:content      # query layer against the live database
npm run check:seed-drift    # migration files still reproduce the database
npm run export:ui-strings   # regenerate docs/ui-strings-review.md
npm run build               # production build
```

**Note on local dev:** an incremental Turbopack build serves a stale prerender after the database changes — a corrected string will not appear until `rm -rf .next`. Content changes do not invalidate the build cache, which is what `/api/revalidate` exists for in production.

**Note on ports:** something outside these sessions serves an older build on **port 3000**. Verification runs use **3100** to avoid touching it.
