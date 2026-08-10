# docs/conventions.md — Coding Conventions

Standard conventions, chosen so Claude Code doesn't have to ask. Deviate only with a logged decision in `docs/decisions.md`.

---

## FILE & FOLDER NAMING

| Thing | Convention | Example |
|---|---|---|
| Route folders | kebab-case, matches the URL | `app/[locale]/work/[caseFile]/` |
| React components | PascalCase files | `components/case-file/DecisionBlock.tsx` |
| Utilities & data access | camelCase files | `lib/content/caseFiles.ts` |
| Types | PascalCase, in `types.ts` per module | `CaseFile`, `Chapter`, `Translation` |
| Scripts | kebab-case | `scripts/sync-notion.ts` |
| Docs | kebab-case `.md` | `docs/sync-contract.md` |
| Database | snake_case tables and columns | `case_files`, `cloudinary_public_id` |
| Slugs | kebab-case, no locale prefix | `egypt-acquisition`, `onboarding` |

---

## DIRECTORY STRUCTURE

```
app/[locale]/…              routes only — no business logic
lib/supabase/client.ts      anon key, browser-safe
lib/supabase/server.ts      service role, server-only
lib/content/                THE ONLY database access layer
lib/utils/                  pure helpers, no I/O
components/layout/          Header · Footer · Nav · Breadcrumb · LocaleSwitch
components/case-file/       Cover · Chapter · DecisionBlock · FeatureStrip · …
components/gallery/         ProjectGrid · ProjectCard · FilterBar
components/media/           CloudinaryImage
components/primitives/      Button · Card · Prose · Tag · Toggle
scripts/                    sync-notion, seed, one-off maintenance
docs/                       documentation
```

**Rule:** if a component needs data, it receives it as props. Only page-level server components call `lib/content/*`.

---

## COMPONENT PATTERNS

- **Server components by default.** Add `'use client'` only for interactivity (filters, toggles, forms).
- **Props are typed.** No `any`. No implicit props.
- **No data fetching inside presentational components.**
- **Every user-facing string is a prop or a `ui_strings` lookup.** Never a literal in JSX.
- **Composition over configuration.** `<Chapter>` composes `<ObjectiveHeader>`, `<DecisionBlock>`, `<FeatureStrip>` — not one component with fifteen boolean flags.

---

## STYLING

- **Tailwind utilities**, with design tokens as CSS variables.
- **Logical properties only** — `ms-4` not `ml-4`, `text-start` not `text-left`, `border-s` not `border-l`. RTL correctness depends on this and it is not optional.
- **No arbitrary values** where a token exists. `text-fg-muted`, not `text-[#767676]`.
- **Responsive from 320px.** Mobile-first breakpoints.
- **No inline styles** except dynamic values that cannot be expressed as classes.

---

## TYPESCRIPT

- `strict: true`
- No `any`. Use `unknown` and narrow.
- Types mirroring database rows live in `lib/content/types.ts` and are the single definition — components import from there.
- Nullable database fields are nullable in TypeScript. Don't assert away the fallback rule.

---

## ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only, never NEXT_PUBLIC_
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NOTION_API_KEY                   # sync script only
REVALIDATE_SECRET
NEXT_PUBLIC_GA_ID
```
`.env.local` is gitignored and never committed. The same values go in the Vercel dashboard.

---

## GIT

**Branches:** `main` (auto-deploys to the staging URL) · `feat/…` · `fix/…` · `docs/…`

**Commits — conventional format:**
```
feat(gallery): add domain and type filters
fix(rtl): use logical properties in Breadcrumb
docs(schema): add translation fallback rule
chore(deps): bump next-intl
content(egypt): sync onboarding chapter
```

**Rules:** one logical change per commit · `TASKS.md` updates commit alongside the work they describe · never commit secrets, NDA assets, or unredacted screens.

---

## DATA ACCESS RULES

1. Pages call `lib/content/*`. Nothing else touches Supabase.
2. Every content query filters `status = 'published'` unless explicitly in preview mode.
3. Translation resolution always goes through `translate.ts` — never query `translations` directly from a page.
4. ISR `revalidate` is set on every content route; publishing calls `/api/revalidate`.

---

## ACCESSIBILITY BASELINE

- Semantic HTML first; ARIA only when semantics can't express it
- Every image has `alt` from `translations` (decorative images: `alt=""`)
- Focus states visible everywhere — never `outline: none` without a replacement
- Contrast meets WCAG AA
- Keyboard-navigable: filters, toggles, forms, and the language switch
- `lang` and `dir` set correctly per locale

---

## ERROR HANDLING

- Missing translation → English fallback → omit the element. Never render an empty heading or a raw key.
- Missing image → omit, don't render a broken frame.
- Failed database call → error boundary with a route back to the gallery. Never a blank page.
- Sync script → fail loudly per entity, continue the rest, print a summary.
