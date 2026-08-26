/**
 * ⚠️ PREVIEW SCAFFOLDING — NOT SITE CONTENT. NEVER RENDERED IN PRODUCTION.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the ONE module on the project that carries human-readable strings in
 * code. `CLAUDE.md` rule 1 is deliberately set aside inside this file and
 * nowhere else, so the exception is visible rather than distributed.
 *
 * WHAT THIS IS FOR. Moataz asked to see the whole site map rendered — every
 * page the project plans, not only the routes that exist — so he can judge
 * shape, sequence and whether things connect, visually rather than from a
 * list. That needs pages at URLs that have nothing behind them yet.
 *
 * WHY THE COPY IS NOT IN NOTION OR SUPABASE. Anything written to either
 * surface is one sync away from the live site, and rule 7 exists because
 * fabricated content shipped once already. So the placeholder copy lives here,
 * behind a flag, where it cannot reach the database and cannot reach a
 * deployment.
 *
 * THE FLAG. `NEXT_PUBLIC_PREVIEW_STUBS`, and it belongs in `.env.local` ONLY —
 * never in the Vercel dashboard, never in a `.env` that is committed, never in
 * a CI environment. With the flag unset every route below does not exist: the
 * catch-all's `generateStaticParams` returns no real path, so the URLs are
 * unmatched and 404 exactly as they do today. See the route file.
 *
 * WHOSE WORDS THESE ARE. Every `purpose` below is Moataz's own, written by him
 * in the `Purpose` property of the Notion page-inventory database, and copied
 * here VERBATIM. Nothing in this file was written to fill a gap: a page with no
 * Purpose in Notion carries `purpose: null` and renders without one. The
 * remaining strings — the labels, the warnings, the words "Not built yet" — are
 * scaffolding chrome. They are not copy for a page that will ship, and none of
 * them should ever be translated, reviewed as site prose, or moved into
 * `ui_strings`.
 *
 * ON ARABIC. The Purposes are English project metadata and there is no Arabic
 * for them. Inventing one would be fabricating content. On `/ar` they render as
 * English marked `lang="en" dir="ltr"`, per decision 053 and `rtl-guard` —
 * which is what the site already does for any untranslated prose.
 */

/** `.env.local` only. See the file header. */
export const PREVIEW_STUBS_ENABLED =
  process.env.NEXT_PUBLIC_PREVIEW_STUBS === "1" ||
  process.env.NEXT_PUBLIC_PREVIEW_STUBS === "true";

/**
 * The catch-all must declare at least one path, always.
 *
 * MEASURED, not assumed: with `dynamicParams = false` and a
 * `generateStaticParams` that returns an EMPTY array, Next 16.3 in dev stops
 * enforcing the param list and the catch-all answers 200 for every unmatched
 * URL on the site — including `/en/nonexistent-xyz`, which must 404. One
 * declared path restores enforcement.
 *
 * So with the flag off the route declares this single sentinel and nothing
 * else, and the page calls `notFound()` on it.
 *
 * ⚠️ THIS IS THE SECOND LOCK, NOT THE FIRST. The real gate is the route file's
 * name — `page.preview.tsx`, which Next does not load as a page unless
 * `pageExtensions` says so, so with the flag off the route does not exist and
 * this branch never runs. The sentinel stays because if anyone renames that
 * file back to `page.tsx`, an empty array would make the catch-all answer 200
 * for every unmatched URL on the site. One of those two failures is loud and
 * the other is silent; this guards the silent one.
 */
export const PREVIEW_DISABLED_SENTINEL = "__preview-stubs-disabled";

/** The preview index — the site map. Its own path, not a stub page. */
export const PREVIEW_INDEX_SEGMENT = "preview";

/** One row of the Notion page inventory. */
export type StubEntry = {
  /** The page's name, as Notion names it. */
  name: string;
  /**
   * Moataz's `Purpose`, verbatim. `null` where Notion has none — never a
   * substitute, never a paraphrase.
   */
  purpose: string | null;
};

export type StubRoute = {
  /** Path segments after `/[locale]`. What the URL actually is. */
  segments: readonly string[];
  /** The route as Notion states it, dynamic parameters intact. */
  template: string;
  /**
   * True when `segments` substitutes an invented example value into
   * `template`, so the page can say so on itself.
   */
  exampleSlug: boolean;
  layer: string;
  section: string;
  /**
   * Usually one. `/door` carries four: the Door is four Notion rows and one
   * route, and collapsing them into one row would hide the sequence, which is
   * the thing being judged.
   */
  entries: readonly StubEntry[];
  /**
   * The heading, where a route has more than one entry and no single Notion
   * name covers it. Set ONLY to the literal prefix his own names already
   * share — never to a title invented for the page.
   */
  routeName?: string;
};

/**
 * ── LAYER 2 — PATHS ────────────────────────────────────────────────────────
 * ── LAYER 3 — DEPTH ────────────────────────────────────────────────────────
 * ── LAYER 5 — CONTRIBUTION ─────────────────────────────────────────────────
 *
 * Order here is the order the index renders. Layer, then section, then the
 * order Notion lists them in.
 */
export const STUB_ROUTES: readonly StubRoute[] = [
  // ── Layer 2 · Utility ─────────────────────────────────────────────────────
  {
    segments: ["how-this-site-works"],
    template: "/how-this-site-works",
    exampleSlug: false,
    layer: "Layer 2 — Paths",
    section: "Utility",
    entries: [
      {
        name: "How This Site Works",
        purpose: "Meta-transparency — the brand-critical honesty page",
      },
    ],
  },

  // ── Layer 2 · Door ────────────────────────────────────────────────────────
  {
    segments: ["door"],
    template: "/door",
    exampleSlug: false,
    layer: "Layer 2 — Paths",
    section: "Door",
    // The literal prefix all four of his own names carry. Not a new title.
    routeName: "The Door",
    entries: [
      {
        name: "The Door — Step 1: Word Cards",
        purpose:
          "[spark] Pure instinct — one tap, primary archetype 2pts + secondary 1pt",
      },
      {
        name: "The Door — Step 2: Time Budget",
        purpose: "[assumption] Second signal, 1pt — forced tradeoff under scarcity",
      },
      {
        name: "The Door — Step 3: Correctable Sentence",
        purpose:
          "[hypothesis] Pre-filled guess by confidence tier — correctable, never a verdict",
      },
      {
        name: "The Door — Step 4: Persona Confirmation",
        purpose: "[fact] The only authoritative step — sets the funnel exit",
      },
    ],
  },
  {
    segments: ["for", "culture"],
    template: "/for/culture",
    exampleSlug: false,
    layer: "Layer 2 — Paths",
    section: "Door",
    entries: [
      {
        name: "Result Screen — Curator",
        purpose:
          "Art-world register — persuasion mechanics deliberately suppressed",
      },
    ],
  },
  {
    segments: ["for", "founders"],
    template: "/for/founders",
    exampleSlug: false,
    layer: "Layer 2 — Paths",
    section: "Door",
    entries: [
      {
        name: "Result Screen — Founder",
        purpose: "Leads with range + velocity + partnership signal",
      },
    ],
  },
  {
    segments: ["for", "hiring"],
    template: "/for/hiring",
    exampleSlug: false,
    layer: "Layer 2 — Paths",
    section: "Door",
    entries: [
      {
        name: "Result Screen — Institution",
        purpose:
          "Leads with the flagship banking outcome metric — fast, proof-first",
      },
    ],
  },
  {
    segments: ["for", "leadership"],
    template: "/for/leadership",
    exampleSlug: false,
    layer: "Layer 2 — Paths",
    section: "Door",
    entries: [
      {
        name: "Result Screen — Leadership",
        purpose:
          "Leads with philosophy + quotable through-line — work as evidence beneath",
      },
    ],
  },
  {
    segments: ["for", "learners"],
    template: "/for/learners",
    exampleSlug: false,
    layer: "Layer 2 — Paths",
    section: "Door",
    entries: [
      {
        name: "Result Screen — Learner",
        purpose: "Leads with teaching + human story — the warmest path",
      },
    ],
  },

  // ── Layer 3 · Work ────────────────────────────────────────────────────────
  /*
   * ⚠️ CUTS SIT UNDER `/work/…` AND THE CATCH-ALL STILL SERVES THEM. The
   * distinction cost a wrong implementation, so it is written down:
   *
   *   `/work/east`                        → `[caseFile]` REJECTS the param
   *                                         (`dynamicParams = false`, `east`
   *                                         unpublished). The subtree
   *                                         short-circuits and the catch-all
   *                                         never sees it, even when it
   *                                         declares that exact path.
   *   `/work/uae-acquisition/cut/example-cut`
   *                                       → `[caseFile]` ACCEPTS the param and
   *                                         no child route matches `cut/…`.
   *                                         That falls through, and the
   *                                         catch-all serves it.
   *
   * The first version of this shipped a real `work/[caseFile]/cut/[cut]/page.tsx`
   * on the assumption that no fall-through was possible. It worked — and with
   * the flag OFF it turned every `/work/<slug>/cut/<anything>` from the designed
   * 404 into Next's `<html id="__next_error__">` shell, because a param miss
   * inside a matched subtree renders the error shell rather than the root
   * not-found. Measured both ways; the file was deleted. Do not add it back.
   */
  {
    segments: ["work", "uae-acquisition", "cut", "example-cut"],
    template: "/work/[caseFile]/cut/[cut]",
    exampleSlug: true,
    layer: "Layer 3 — Depth",
    section: "Work",
    entries: [
      {
        name: "Cuts (network)",
        purpose: "Cold-link-safe 2-3 min extracts answering one question each",
      },
    ],
  },
  {
    segments: ["experiments"],
    template: "/experiments",
    exampleSlug: false,
    layer: "Layer 3 — Depth",
    section: "Work",
    entries: [
      {
        name: "Experiments — Index",
        purpose: "Small demos and vibe-coded prototypes by domain",
      },
    ],
  },
  {
    segments: ["experiments", "example-experiment"],
    template: "/experiments/[slug]",
    exampleSlug: true,
    layer: "Layer 3 — Depth",
    section: "Work",
    entries: [
      {
        name: "Experiments — Detail",
        purpose: "One experiment: embed + what I tried/learned",
      },
    ],
  },

  // ── Layer 3 · Read ────────────────────────────────────────────────────────
  {
    segments: ["read"],
    template: "/read",
    exampleSlug: false,
    layer: "Layer 3 — Depth",
    section: "Read",
    entries: [
      {
        name: "Read — Index",
        purpose: "Article index with stream filters and language badges",
      },
    ],
  },
  {
    segments: ["read", "example-article"],
    template: "/read/[slug]",
    exampleSlug: true,
    layer: "Layer 3 — Depth",
    section: "Read",
    entries: [
      {
        name: "Read — Article View",
        purpose: "Medium-style reader with section-level bilingual toggle",
      },
    ],
  },
  {
    segments: ["read", "series", "example-series"],
    template: "/read/series/[series]",
    exampleSlug: true,
    layer: "Layer 3 — Depth",
    section: "Read",
    entries: [
      {
        name: "Read — Series View",
        purpose: "Ordered multi-part collections with 'next in series'",
      },
    ],
  },

  // ── Layer 3 · Studio ──────────────────────────────────────────────────────
  {
    segments: ["studio"],
    template: "/studio",
    exampleSlug: false,
    layer: "Layer 3 — Depth",
    section: "Studio",
    entries: [
      {
        name: "Studio — Index",
        purpose: "The fine-art practice — gallery-paced, documentation-forward",
      },
    ],
  },
  {
    segments: ["studio", "example-work"],
    template: "/studio/[work]",
    exampleSlug: true,
    layer: "Layer 3 — Depth",
    section: "Studio",
    entries: [
      {
        name: "Studio — Single Work",
        purpose: "One artwork, image-forward with statement and provenance",
      },
    ],
  },

  // ── Layer 5 · Systems ─────────────────────────────────────────────────────
  {
    segments: ["systems", "open-source"],
    template: "/systems/open-source",
    exampleSlug: false,
    layer: "Layer 5 — Contribution",
    section: "Systems",
    entries: [
      {
        name: "Open-Source Community Design System",
        purpose:
          "The free public system — generosity play feeding the public-figure goal",
      },
    ],
  },
  {
    segments: ["systems", "this-website"],
    template: "/systems/this-website",
    exampleSlug: false,
    layer: "Layer 5 — Contribution",
    section: "Systems",
    entries: [
      {
        name: "This Website — Case Study Zero",
        purpose: "The portfolio documenting itself — the thesis made literal",
      },
    ],
  },
];

/**
 * The four draft mini case files.
 *
 * They exist in the database with `status <> 'published'`, so every
 * `lib/content` query filters them out and `/work/east` 404s. Under the flag
 * they render a stub from `work/[caseFile]/page.tsx`, because — see the Cuts
 * comment above — the catch-all cannot reach under `/work`.
 *
 * ⚠️ THESE CARRY NO TITLE AND NO PURPOSE, and that is a reported gap rather
 * than something to fill. `lib/content` cannot read an unpublished row, and
 * Notion supplied no `Purpose` for them. The stub shows the slug. Nobody
 * should write a title here to make the page look finished.
 */
export const DRAFT_CASE_FILE_SLUGS = [
  "east",
  "pidetaxi",
  "kshemam",
  "aam-advisor",
] as const;

export const DRAFT_CASE_FILE_LAYER = "MVP-1 — draft";
export const DRAFT_CASE_FILE_SECTION = "Work";

/** Planned surfaces that are not pages, and must never be given a route. */
export type NonRoute = {
  name: string;
  /** Where it lives, as Notion states it. Not a link. */
  where: string;
  layer: string;
  purpose: string | null;
};

export const NON_ROUTES: readonly NonRoute[] = [
  {
    name: "Admin — Analytics Dashboard",
    where: "/admin/dashboard · auth-gated",
    layer: "Layer 4",
    purpose: null,
  },
  {
    name: "Ask — AI Chat Layer",
    where: "/api/ask · a global overlay, not a page",
    layer: "Layer 4",
    purpose: null,
  },
];

/**
 * Every stub path the catch-all serves, in order. Index first.
 *
 * Including the Cuts path under `/work/…` — see the note on that route above:
 * the catch-all does reach a deeper unmatched route under a case-file segment
 * whose param resolved, and only that is needed here.
 */
export function stubCatchAllPaths(): readonly (readonly string[])[] {
  return [[PREVIEW_INDEX_SEGMENT], ...STUB_ROUTES.map((r) => r.segments)];
}

/** The stub route a catch-all request resolves to, or undefined. */
export function findStubRoute(segments: readonly string[]): StubRoute | undefined {
  const key = segments.join("/");
  return STUB_ROUTES.find((r) => r.segments.join("/") === key);
}

/**
 * ── SCAFFOLDING CHROME ─────────────────────────────────────────────────────
 *
 * Labels for the preview surfaces themselves. English only, deliberately: this
 * is a local tool, not a page, and translating it would make it look like
 * something that ships. Every one of these renders marked `lang="en"
 * dir="ltr"` so it reads correctly inside the Arabic document.
 *
 * ⚠️ NOTHING HERE NAMES A TOOL OR A MECHANISM. Corrected 2026-08-26 by Moataz:
 * *"لما يبقى فيه content مش موجود في Notion وإنت عايز تعمله draft في الـ
 * website، بنكتب عليه content is not ready yet… مش بنكتب إن هو مش موجود في
 * Notion."*
 *
 * These strings were written as if only a developer would ever read them, and
 * they said so: `noPurposeNotice` named Notion, `draftNotice` explained the
 * database and the flag, `indexLede` named the environment variable. **A
 * visitor does not know Notion exists**, and these pages are reachable by
 * direct link on the live site. The absence is ours to own — *content is not
 * ready yet* — not a fact about where we keep our files.
 *
 * The rule holds for anything added here: name what the reader is missing,
 * never the machinery behind it.
 */
export const CHROME = {
  kicker: "Preview",
  indexTitle: "Site map",
  indexLede:
    "Every page the project plans, built and unbuilt, at the route it will live on. Unbuilt pages render a stub carrying the purpose written for them. Nothing on this page is site content.",
  purposeLabel: "Purpose",
  routeLabel: "Route",
  servedLabel: "Served at",
  layerLabel: "Build layer",
  sectionLabel: "Section",
  stateBuilt: "Built",
  stateNotBuilt: "Not built",
  stateDraft: "Draft",
  stateNotAPage: "Not a page",
  notBuiltHeading: "Not built yet",
  stubNotice:
    "Preview scaffolding. This page does not exist — it is a placeholder standing at the route, so the shape of the site can be read before the page is written.",
  exampleSlugNotice:
    "The slug in this URL is invented so the route can be visited. There is no such thing behind it.",
  noPurposeNotice: "Content is not ready yet.",
  draftNotice:
    "A draft case file. Its content is not ready yet, so the page is not published.",
  doorNote: "Four steps, one route.",
  backToIndex: "Site map",
  builtHeading: "MVP-1 — built",
  nonRouteHeading: "Not pages",
  caseFileLabel: "Case file",
  chapterLabel: "Chapter",
} as const;
