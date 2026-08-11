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
const SKIP_PREFIXES = [
  "FOUNDATION —",
  "The Door —",
  "Result Screen —",
  "Read —",
  "Studio —",
  "Experiments —",
  "Admin —",
  "Ask —",
  "Cuts",
  "This Website",
  "Open-Source",
  "How This Site Works",
];

/** Normalise the various dash characters Notion titles use. */
function normalise(title: string): string {
  return title.replace(/[—–]/g, "—").trim();
}

export function classifyTitle(rawTitle: string): Classification {
  const title = normalise(rawTitle);

  for (const prefix of SKIP_PREFIXES) {
    if (title.toLowerCase().startsWith(normalise(prefix).toLowerCase())) {
      return { kind: "skip", reason: `build task or future layer (${prefix})` };
    }
  }

  // Linear views are derived at render from the chapters — no row of their own.
  if (/^Linear View\s*—/i.test(title)) {
    return { kind: "skip", reason: "linear view is derived at render" };
  }

  let m = /^Case File Cover\s*—\s*(.+)$/i.exec(title);
  if (m) return { kind: "case_file", name: m[1].trim() };

  m = /^Mini Case File\s*—\s*(.+)$/i.exec(title);
  if (m) return { kind: "case_file", name: m[1].trim() };

  m = /^Results Table\s*—\s*(.+)$/i.exec(title);
  if (m) return { kind: "targets", parent: m[1].trim(), name: m[1].trim() };

  // "Chapter — {case file} / {chapter}". The parent is the segment before " / ".
  m = /^Chapter\s*—\s*(.+)$/i.exec(title);
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

  m = /^Comparison\s*—\s*(.+)$/i.exec(title);
  if (m) return { kind: "comparison", name: m[1].trim() };

  m = /^Accessibility\s*—\s*(.+)$/i.exec(title);
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

export type RouteClaim = { title: string; route: string; kind: EntityKind };

/**
 * Find routes claimed by more than one row of the SAME kind.
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
 */
export function findRouteCollisions(
  claims: readonly RouteClaim[],
): Map<string, string[]> {
  const byKey = new Map<string, { route: string; titles: string[] }>();

  for (const claim of claims) {
    if (claim.kind === "skip") continue;
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
  const headings = isTargets ? ["targets", "results"] : ["outcomes"];

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
