# docs/redaction-brief.md — Redaction Treatment Brief

**For:** designing the NDA redaction language in Claude Design (open question H).
**Status:** answered 2026-08-11 — see **§0 Working spec** below. The design is being made against it; the treatment itself is still to come.

Decision 002 calls redaction "a deliberate, crafted treatment — not hidden, not omitted". Everything below is about making that buildable.

---

## 0. Working spec — answered, and implemented where it can be

Moataz's answers to §7, treated as the working spec pending the finished design. Logged as decisions 027 and 028.

| # | Answer | Status |
|---|---|---|
| **Baking** | Redaction is baked into the pixels before upload. The unredacted original never reaches Cloudinary | ✅ Decision 027. In `CLAUDE.md` rule 6 |
| **1 Uniform vs per-image** | **Per-image.** Only the sensitive fields are masked; the interface stays legible. Showing the design while hiding the data is the point | ✅ Follows from baking — no transform could do this |
| **2 Geometry** | **Solid filled blocks** over data fields. Not blur, not pixelation: blur reads as a broken screenshot, a crisp block reads as deliberate, and it echoes the Required Fields art concept — data replaced by shape | ⏳ Design |
| **3 Values** | `--color-redacted-fill` / `--color-redacted-stroke` stay the interface. Fill is a mid-tone that reads intentional in both themes; stroke is a 1px hairline consistent with the design language | ⏳ Values to come. Tokens exist as placeholders |
| **4 Badge** | **Always visible, bottom-left**, sitting with the caption rule. Quiet, not stamped across the image | ⏳ Position to implement; badge already renders |
| **5 Small sizes** | **No simplified variant.** Blocks scale. Verify legibility at 200px | ⏳ Verify when the treatment lands |
| **6 Aspect** | **Never cropped.** `c_fit`, never `c_fill` — an off-centre crop clipping a mask would leak | ✅ Structural: `CloudinaryImage` forces the redacted preset when `media.redacted`, so the redacted path *cannot* crop |
| **7 Cover / OG** | **Never.** Those get shared into LinkedIn and WhatsApp previews outside our control. A redacted media id in either slot must fail, not render | ✅ Enforced by three database triggers plus a query-layer guard |

### What "enforced" means, concretely

Three triggers, each verified against a live attempt:

| Attack | Result |
|---|---|
| Insert a case file with a redacted cover | blocked |
| Update a case file's cover to a redacted asset | blocked |
| **Bypass** — upload a clean cover, then mark it redacted | blocked |
| Point `settings.og_image` at a redacted asset | blocked |
| *Control:* clean cover, clean OG image | accepted |

The database is the enforcement point rather than `lib/content` alone, because the writers are plural and growing: the Notion sync script today, an admin panel in Layer 4, and the Supabase table editor at any time. A rule that lives only in application code is a rule the table editor does not have.

---

## 1. The one thing to decide first

**Is the treatment the same on every image, or art-directed per image?**

Everything else follows from this.

- **Uniform** — the same operation applied to every redacted image (e.g. "the whole image is reduced to a flat field with a diagonal cut"). Can live as a single named Cloudinary transform. Cheapest to build, consistent by construction.
- **Per-image** — specific regions masked (this account number, that customer name). Cannot be a global transform: the coordinates differ per image, and there is nowhere in the schema to store them. Requires the masking to be done **before upload**.

Per-image is the stronger design and probably what the work needs. Assume that unless you decide otherwise — and see §3, which pushes the same way for a harder reason.

---

## 2. What the component gets, and what it can't do

`CloudinaryImage` receives:

| From | Value |
|---|---|
| `media.cloudinary_public_id` | The asset id. **URLs are never stored** (rule 3) |
| `media.redacted` | `true` / `false` |
| `media.width` · `height` · `format` | For aspect ratio and layout stability |
| `translations` field `alt` | Alt text |
| `translations` field `caption` | Optional visible caption |
| `ui_strings.redacted_notice` | The shared badge label — already seeded, EN "Redacted under NDA" / AR "محجوب بموجب NDA" |

**It can:** pick a named transform preset, request a size, set the aspect box, render a border/badge/caption around the image, and switch treatment on the `redacted` boolean.

**It cannot:** know where anything sensitive is in the picture, vary the treatment per image, or make an art-direction call. It has one boolean. If the design needs more than "redacted: yes/no" at render time, that needs a schema change and we should talk before you finalise.

---

## 3. Bake it in, don't apply it live — and this is the important part

A live Cloudinary transform does **not** remove the original. `https://…/t_redacted/abc123` is a derived asset; `https://…/abc123` still returns the untouched image. Anyone who sees a redacted URL can strip the transform segment and fetch the original.

The brief calls published NDA material "a hard failure regardless of any other outcome". A guessable URL away from the unredacted Mashreq screen is not an acceptable posture.

**Recommendation: the redaction is baked into the pixels before upload. The unredacted original never reaches Cloudinary at all.**

Consequences, all of which are fine:

- You have complete freedom in the design tool — masks, geometry, typography, anything. No Cloudinary effect vocabulary constrains you.
- Cloudinary's named transforms then handle only what they should: resize, crop, format, quality.
- Rule 3 still holds — we store `public_id`, presets are named.
- The asset is the record. If a redaction is wrong, it is re-exported and re-uploaded under a new `public_id`, not "fixed with a URL parameter".

Cloudinary does offer strict transformations and authenticated delivery as an alternative, which restrict access to the base asset. They work, but they add signing to every image request and make one misconfiguration the difference between compliant and not. Baking has no failure mode.

> If you want a *live* treatment anyway for non-NDA images — a house look for all evidence shots, say — that is a separate, safe use and can be a named transform. Just don't let it be what protects NDA material.

---

## 4. Cloudinary effects, if you do want a live component

Useful if part of the treatment is uniform (a tint, a grain, a border) layered over an already-baked mask. Cost below is **first request only** — every derived asset is CDN-cached afterwards, so this is a one-time cost per size variant, not per visitor.

| Effect | Roughly | Cost |
|---|---|---|
| `e_blur:<n>` | Gaussian blur | Cheap at low radius; noticeably slower at high radius on large sources |
| `e_pixelate:<n>` | Square mosaic | Cheap |
| `e_blur_region` / `e_pixelate_region` | Same, confined to `x,y,w,h` | Cheap — but the coordinates are per image, which is exactly the problem in §1 |
| `e_grayscale`, `e_blackwhite:<t>` | Desaturate / threshold | Cheap |
| `e_colorize:<n>` + `co_rgb:xxxxxx` | Flood with one colour | Cheap. Good for a flat "field" look |
| `l_<public_id>` overlay, `o_<n>`, `b_<colour>` | Composite another asset over it | Cheap; one extra fetch |
| `l_text:<font>_<size>:<text>` | Burnt-in text | Cheap — **but don't**: text baked into an image can't be translated, and this site is bilingual. The badge belongs in HTML |
| `e_oil_paint`, `e_vectorize` | Heavy stylisation | Slow, seconds on large images. Avoid |

Two flags belong on every preset regardless: `f_auto` (format negotiation) and `q_auto` (quality). Both are pure wins.

Treat exact parameter syntax as needing a check against Cloudinary's current docs at implementation time — the effect *names* are stable, the parameter ranges less so.

---

## 5. The caption and badge

Two separate things; keep them separate.

- **Badge** — the shared `redacted_notice` string. Same on every redacted image, already translated. This is what makes the treatment legible as *deliberate* rather than as a broken asset. Tell me where it sits (corner? on the rule beneath? overlapping the edge?) and whether it's always visible.
- **Caption** — optional, per image, from `translations` field `caption`. Free text, either language, may be absent. Design for both "caption present" and "caption absent"; absent is normal and must not leave a gap.

Neither may be burnt into the image — both need to flip language with the page.

---

## 6. Accessibility constraints

Non-negotiable, from `docs/conventions.md`:

1. **Not colour alone.** If "this is redacted" reads only as a colour shift, it fails. Pair it with geometry, the badge, or a border change — something that survives greyscale.
2. **Alt text is public HTML.** It ships in the page source and is indexed. So alt must describe *the redacted image as it appears* — "onboarding screen with customer details masked" — and must never describe the concealed content. Alt text is the easiest place to leak the exact thing the picture is hiding.
3. **Contrast.** The badge and caption meet WCAG AA against whatever the treatment puts behind them. If the treatment is a flat mid-tone field, check both themes.
4. **Both themes.** It must read as intentional on `#000` and on `#fff`. Tokens exist (`--color-redacted-fill`, `--color-redacted-stroke`) but are placeholders aliasing existing values — replace them.
5. **No reveal interaction.** No hover-to-unblur, no click-to-reveal, no progressive disclosure. Decision 023 rules out animation in MVP-1, and more importantly a reveal implies a recoverable original, which §3 says must not exist.

---

## 7. What I need from you to build it

- **Uniform or per-image** (§1).
- **Geometry** — full-frame, bars, blocks, a cut? At what scale relative to the image?
- **Values** — fill and stroke, per theme, or a rule for deriving them from existing tokens.
- **Badge placement and behaviour** — always visible, or only at certain sizes?
- **Small sizes.** A redacted image appears at `thumb` and `card` (~200–400px) as well as `hero`. Does the treatment still read at 200px, or does it need a simplified variant? If simplified, that's a second preset.
- **Aspect handling** — may redacted images be cropped by the presets, or must they stay uncropped so the masking isn't cut off? This one matters: an off-centre crop could clip a mask.
- **May a redacted image be a case-file cover or the `og_image`?** Both get shared outside the site, the OG image into LinkedIn and WhatsApp previews.

---

## 8. What exists today

`RedactedEvidence` is not built. `media.redacted` exists and is respected by the schema. The two colour tokens are placeholders. Presets `thumb` / `card` / `hero` / `gallery` are being built now (0.8); `redacted` is deliberately left as a plain bordered surface with its badge and caption, so nothing speculative gets baked in ahead of your design.

Nothing is blocked on this — Phase 1 pages can be built and the treatment dropped in later. It blocks publishing any Mashreq evidence, and therefore the launch gate.
