/**
 * Pure classification and parsing for the Notion sync.
 *
 * Deliberately free of Notion and Supabase imports so every rule the contract
 * cares about can be tested without credentials or network. The orchestration
 * in scripts/sync-notion.ts is thin; the decisions live here.
 *
 * See docs/sync-contract.md.
 */

export type EntityKind =
  | "case_file"
  | "chapter"
  | "targets"
  | "comparison"
  | "accessibility"
  | "static"
  | "skip";

export type Classification = {
  kind: EntityKind;
  /** Case-file segment for chapters and results tables. */
  parent?: string;
  /** Human-readable name from the title, for reporting. */
  name?: string;
  /** Why a row was skipped — reported, never silent. */
  reason?: string;
};

/**
 * Rows that are build tasks or future-layer pages, not content.
 * Contract Step 1. Matched case-insensitively on the title prefix.
 */
/**
 * The separator between a title's KIND and its NAME.
 *
 * Three characters, not one: em dash (`—`), en dash (`–`) and plain hyphen
 * (`-`). The character carries no meaning here. It divides "what kind of page
 * is this" from "which one", and which dash somebody typed is not a fact about
 * the page. Accepting all three is what stops a title's punctuation from
 * deciding whether the page syncs at all.
 *
 * ⚠️ This is deliberately NOT done by normalising the whole title. Folding
 * every hyphen into an em dash would corrupt the NAMES: the chapter
 * `On-Premises to Cloud`, the skip prefix `Open-Source`, the build task
 * `AI-reader compliance`. The separator is consumed ONCE, anchored at the
 * front, and every hyphen after it is left exactly as written.
 *
 * Two pages sat unrecognised because of this. `Chapter - Neobiz Mobile /
 * Onboarding` and `Chapter - UAE / Mobile Onboarding Journey` were written
 * with a hyphen, failed every `—` test, and fell through to `static` — which
 * the dry run then reported as "not yet implemented" rather than as broken.
 * A page that is silently the wrong KIND is the worst shape this bug can take,
 * because every downstream count still adds up.
 */
const SEP = String.raw`\s*[—–-]\s*`;

/** `^<kind><separator><name>` — the shape every content title has. */
function titleRe(kind: string): RegExp {
  return new RegExp(`^${kind}${SEP}(.+)$`, "iu");
}

/**
 * Rows that are build tasks or future-layer pages, not content.
 * Contract Step 1.
 *
 * Split in two because they are matched two different ways. The first group is
 * a KIND and must be followed by a separator, so `Read` skips `Read - Index`
 * without also skipping a page that merely starts with those letters. The
 * second group is a whole-title prefix with no separator to speak of.
 */
const SKIP_KINDS = [
  "FOUNDATION",
  "The Door",
  "Result Screen",
  "Read",
  "Studio",
  "Experiments",
  "Admin",
  "Ask",
];

const SKIP_PREFIXES = ["Cuts", "This Website", "Open-Source", "How This Site Works"];

export function classifyTitle(rawTitle: string): Classification {
  const title = rawTitle.trim();

  for (const kind of SKIP_KINDS) {
    if (titleRe(kind).test(title)) {
      return { kind: "skip", reason: `build task or future layer (${kind})` };
    }
  }

  for (const prefix of SKIP_PREFIXES) {
    if (title.toLowerCase().startsWith(prefix.toLowerCase())) {
      return { kind: "skip", reason: `build task or future layer (${prefix})` };
    }
  }

  // Linear views are derived at render from the chapters — no row of their own.
  if (new RegExp(`^Linear View${SEP}`, "iu").test(title)) {
    return { kind: "skip", reason: "linear view is derived at render" };
  }

  let m = titleRe("Case File Cover").exec(title);
  if (m) return { kind: "case_file", name: m[1].trim() };

  m = titleRe("Mini Case File").exec(title);
  if (m) return { kind: "case_file", name: m[1].trim() };

  m = titleRe("Results Table").exec(title);
  if (m) return { kind: "targets", parent: m[1].trim(), name: m[1].trim() };

  // "Chapter - {case file} / {chapter}". The parent is the segment before " / ".
  m = titleRe("Chapter").exec(title);
  if (m) {
    const rest = m[1];
    const slash = rest.indexOf("/");
    if (slash === -1) {
      return {
        kind: "skip",
        reason: `chapter title has no " / " separator, cannot resolve its case file: "${rawTitle}"`,
      };
    }
    return {
      kind: "chapter",
      parent: rest.slice(0, slash).trim(),
      name: rest.slice(slash + 1).trim(),
    };
  }

  m = titleRe("Comparison").exec(title);
  if (m) return { kind: "comparison", name: m[1].trim() };

  m = titleRe("Accessibility").exec(title);
  if (m) return { kind: "accessibility", name: m[1].trim() };

  // Anything else is static page content keyed by route.
  return { kind: "static", name: title };
}

/**
 * Derive a slug from the Route property.
 *
 * Contract Step 2: strip `/[locale]/`, take the final segment. Covers take the
 * case-file segment. Routes carrying a parenthesised annotation — Notion uses
 * `/work/cervello (close)` for results tables — are stripped of it first.
 */
export function routeToSlug(
  route: string | null | undefined,
): { caseFile: string | null; slug: string | null; error?: string } {
  if (!route || !route.trim()) {
    return { caseFile: null, slug: null, error: "Route is empty" };
  }

  // Non-page rows: "(infrastructure)", "content/case-files/*.ts", "*"
  const cleaned = route.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (!cleaned.startsWith("/")) {
    return { caseFile: null, slug: null, error: `Route is not a path: "${route}"` };
  }

  const segments = cleaned
    .replace(/^\/\[locale\]/, "")
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    // "/[locale]" — the landing page.
    return { caseFile: null, slug: "landing" };
  }

  if (segments[0] === "work" && segments.length >= 2) {
    return {
      caseFile: segments[1],
      slug: segments.length >= 3 ? segments[segments.length - 1] : segments[1],
    };
  }

  return { caseFile: null, slug: segments[segments.length - 1] };
}

/* -------------------------------------------------------------------------
 * Status markers — decision 007 surviving automation.
 * ---------------------------------------------------------------------- */

export const OUTCOME_STATUSES = ["projected", "achieved", "not-measurable"] as const;
export const TARGET_STATUSES = ["achieved", "missed", "not-measurable"] as const;

export type ParsedItem = {
  label: string;
  status: string;
  note: string | null;
};

/**
 * Parse one outcome or target line.
 *
 *   1,500+ SME accounts [projected]
 *   Completion time reduction [not-measurable] — no baseline captured
 *
 * Returns an Error rather than throwing so the caller can abort THAT entity
 * and continue the rest of the sync, per the contract's failure policy.
 *
 * NEVER defaults. A line without a marker is a hard failure: guessing a status
 * is exactly how an unverified figure reaches the site as though it were
 * confirmed.
 */
export function parseStatusItem(
  line: string,
  allowed: readonly string[],
): ParsedItem | Error {
  const text = line.trim();
  if (!text) return new Error("empty line");

  const marker = /\[([^\]]+)\]/.exec(text);
  if (!marker) {
    return new Error(
      `missing status marker in "${text}". Expected one of ` +
        `${allowed.map((s) => `[${s}]`).join(", ")}. ` +
        "No default is applied — see decision 007.",
    );
  }

  const status = marker[1].trim().toLowerCase();
  if (!allowed.includes(status)) {
    return new Error(
      `unknown status "[${marker[1].trim()}]" in "${text}". ` +
        `Expected one of ${allowed.map((s) => `[${s}]`).join(", ")}.`,
    );
  }

  const label = text.slice(0, marker.index).trim();
  if (!label) return new Error(`status marker with no label: "${text}"`);

  // Anything after the marker, following an em dash, is the note.
  const after = text.slice(marker.index + marker[0].length).trim();
  const note = after.replace(/^[—–-]\s*/, "").trim() || null;

  return { label, status, note };
}

/* -------------------------------------------------------------------------
 * Route collisions.
 * ---------------------------------------------------------------------- */

export type RouteClaim = {
  title: string;
  route: string;
  kind: EntityKind;
  /** Whether the row is flagged In MVP-1. Parked rows cannot collide. */
  inMvp: boolean;
};

/**
 * Find routes claimed by more than one row of the SAME kind, within MVP-1.
 *
 * The contract calls this out by name: two rows claim
 * `/[locale]/work/cervello`, and an upsert keyed on slug would silently
 * overwrite one with the other — the loser depending on iteration order, which
 * is not stable. Detected up front so the sync aborts those rows before any
 * write, rather than producing a plausible-looking wrong result.
 *
 * Kind is part of the key, and that is load-bearing rather than fussy. A
 * results table legitimately shares its parent's route with a "(close)"
 * annotation — in the live database that is true of Egypt, Neobiz AND Cervello.
 * Comparing on route alone flagged all three as collisions and would have
 * aborted six valid rows. A check that fires on correct data teaches everyone
 * to ignore it, which costs more than having no check at all.
 *
 * Rows OUTSIDE MVP-1 are ignored entirely, for the same reason. The live
 * Cervello collision was between a finished MVP-1 cover and a Layer 3 row
 * parked with no content — a row deliberately excluded from this release was
 * blocking one that ships in it, along with seven chapters underneath it. A
 * parked row is not a competing claim; it is a note to self about later.
 *
 * The trade-off, stated: two parked rows colliding with each other is not
 * reported. That is intended — it is a problem about content nobody is
 * building yet, and it becomes visible the moment either row joins MVP-1.
 */
export function findRouteCollisions(
  claims: readonly RouteClaim[],
): Map<string, string[]> {
  const byKey = new Map<string, { route: string; titles: string[] }>();

  for (const claim of claims) {
    if (claim.kind === "skip") continue;
    if (!claim.inMvp) continue;
    const cleaned = claim.route.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (!cleaned.startsWith("/")) continue;

    const key = `${claim.kind}::${cleaned}`;
    const entry = byKey.get(key) ?? { route: cleaned, titles: [] };
    entry.titles.push(claim.title);
    byKey.set(key, entry);
  }

  const collisions = new Map<string, string[]>();
  for (const { route, titles } of byKey.values()) {
    if (titles.length > 1) collisions.set(route, titles);
  }
  return collisions;
}

/* -------------------------------------------------------------------------
 * Decision blocks.
 * ---------------------------------------------------------------------- */

/**
 * A chapter's decision heading is compound: the decision's NAME is part of it.
 *
 *   Decision · The language fight
 *   القرار · معركة اللغة
 *   القرار الأول · أربع طبقات متداخلة        (ordinal when a chapter has several)
 *
 * A chapter may carry several, deliberately — a chapter with three decisions
 * has three decisions, and collapsing them into one field would flatten the
 * most valuable content in the case study.
 *
 * Returns null for a heading that is not a decision.
 */
/**
 * Does this heading ANNOUNCE itself as a decision, whether or not it parses?
 *
 * The candidate test for `sift`. A chapter body is full of headings that are
 * legitimately not decisions — `Objective`, `Context`, `Result` — and those must
 * not be counted as dropped items or every chapter on the site would refuse.
 * What must be counted is a near-miss: a heading that opens with the decision
 * word and then fails to yield a name, e.g. `Decision ·` with nothing after it,
 * or `القرار الأول` with no separator at all. Something was meant to be there.
 */
export function looksLikeDecisionHeading(heading: string): boolean {
  /*
   * The terminator is spelled out rather than `\b`. `\b` is defined against
   * `\w` = [A-Za-z0-9_], so there is NO word boundary after Arabic letters and
   * `/^القرار\b/` matches nothing at all. That exact mistake cost a session
   * earlier this week in findArabicChild; it is not repeated here.
   */
  return /^(Decision|القرار)($|[\s·:—–-])/iu.test(heading.trim());
}

export function parseDecisionHeading(heading: string): { name: string } | null {
  const text = heading.trim();

  // English: "Decision · Name"
  let m = /^Decision\s*[·:—–-]\s*(.+)$/i.exec(text);
  if (m) return { name: m[1].trim() };

  // Arabic: "القرار · Name" or "القرار الأول · Name"
  m = /^القرار(?:\s+\S+)?\s*[·:—–-]\s*(.+)$/u.exec(text);
  if (m) return { name: m[1].trim() };

  return null;
}

/* -------------------------------------------------------------------------
 * Choosing the item lines for an outcomes or targets section.
 * ---------------------------------------------------------------------- */

export type ItemSelection = {
  lines: string[];
  /** How they were found — reported in the dry run so the source is visible. */
  source: "table" | "table-fallback" | "prose" | "none";
};

/**
 * Pick the lines that become outcome or target rows.
 *
 * Order matters and each step earned its place:
 *
 *  1. A table under an EXPECTED heading. Authoritative when present.
 *  2. For a targets page only: ANY table on the page. A "Results Table — X"
 *     page IS a results table whatever its headings are called, and relying on
 *     the heading is what made an earlier run report zero failures while
 *     syncing zero targets — the parser found nothing and skipped in silence.
 *  3. Prose under an expected heading (the legacy one-line form).
 *  4. Nothing — which the caller reports rather than skipping.
 */
export function selectItemLines(
  body: ReadonlyMap<string, string[]>,
  isTargets: boolean,
): ItemSelection {
  /*
   * `Results` is a synonym for `Outcomes` on a cover. The covers are written
   * with `## Results` / `## النتائج` and only Egypt used `## Outcomes`, so the
   * parser found three of four covers empty and reported missing content that
   * was in fact written. The heading flexes; the writing does not.
   *
   * `results` appearing in both lists is not a conflict: a cover and a
   * "Results Table —" page are distinguished by entity kind, never by heading.
   * (The Arabic `النتائج` is already folded to `outcomes` by HEADING_SYNONYMS.)
   */
  const headings = isTargets ? ["targets", "results"] : ["outcomes", "results"];

  const expected = headings.flatMap((h) => body.get(`${h}::table`) ?? []);
  if (expected.length > 0) return { lines: expected, source: "table" };

  if (isTargets) {
    for (const [key, value] of body) {
      if (key.endsWith("::table") && value.length > 0) {
        return { lines: value, source: "table-fallback" };
      }
    }
  }

  const prose = headings.flatMap((h) => body.get(h) ?? []);
  if (prose.length > 0) return { lines: prose, source: "prose" };

  return { lines: [], source: "none" };
}

/**
 * Claims asserted in more than one place with DIFFERENT statuses.
 *
 * The failure this catches actually happened: the Egypt cover's outcomes table
 * and its separate Results Table page carried the same claims with conflicting
 * markers, and it survived several rounds of review because each review only
 * ever looked at the page being edited. A marker system that can hold two
 * answers for one claim is not an integrity system.
 *
 * Claims are compared on normalised text — case, punctuation and whitespace
 * folded — because the same figure is rarely typed identically twice.
 */
export function findStatusContradictions(
  claims: readonly { text: string; status: string; source: string }[],
): { claim: string; conflicting: { status: string; source: string }[] }[] {
  const normalise = (t: string) =>
    t
      .toLowerCase()
      .replace(/\[[^\]]*\]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();

  const byClaim = new Map<string, { display: string; seen: Map<string, string> }>();

  for (const c of claims) {
    const key = normalise(c.text);
    if (!key) continue;
    const entry = byClaim.get(key) ?? { display: c.text, seen: new Map() };
    if (!entry.seen.has(c.status)) entry.seen.set(c.status, c.source);
    byClaim.set(key, entry);
  }

  const out: { claim: string; conflicting: { status: string; source: string }[] }[] = [];
  for (const entry of byClaim.values()) {
    if (entry.seen.size > 1) {
      out.push({
        claim: entry.display,
        conflicting: [...entry.seen].map(([status, source]) => ({ status, source })),
      });
    }
  }
  return out;
}

/**
 * Rows flagged into MVP-1 with no content written.
 *
 * Contract known-issue 3. Not fatal to the run, but reported loudly: syncing a
 * case file with nothing in it produces an empty page that looks broken.
 */
export function findEmptyMvpRows(
  rows: readonly {
    title: string;
    inMvp: boolean;
    contentReady: string | null;
    kind?: EntityKind;
  }[],
): string[] {
  return rows
    .filter((r) => r.inMvp && r.contentReady !== "Done")
    // A skipped row is not synced at all, so reporting it as "flagged into
    // MVP-1 but not ready" is noise that buries the rows this is actually
    // about. In the live data that is 4 FOUNDATION rows and 3 Linear Views
    // drowning 4 real mini case files.
    .filter((r) => r.kind !== "skip")
    .map((r) => `${r.title} (Content ready: ${r.contentReady ?? "unset"})`);
}
