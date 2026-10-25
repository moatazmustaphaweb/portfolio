/**
 * Revalidate on publish — decision 061 item 6, executing decision 009.
 *
 * The sync collects every route it wrote and, on a live run, POSTs them to
 * `/api/revalidate` on each deployment. Without it, a publish waits out the
 * ISR window (revalidate = 300 on every route).
 *
 * ⚠️ PATHS ARE LOCALE-AGNOSTIC. `app/api/revalidate/route.ts` expands each
 * path to `/en/...` AND `/ar/...` itself, so sending `/en/work/x` here would
 * revalidate `/en/en/work/x` and `/ar/en/work/x` — two routes that do not
 * exist — and report success. Every path here starts with `/` and carries no
 * locale.
 *
 * Pure except `postRevalidate`, which takes `fetch` as a parameter so the
 * tests need no network.
 */

/** A case file write touches its cover, the linear view and the results page. */
export function pathsForCaseFile(caseFile: string): string[] {
  return [`/work/${caseFile}`, `/work/${caseFile}/all`, `/work/${caseFile}/results`];
}

/**
 * A chapter (including comparison and accessibility kinds, which share the
 * route shape) renders on its own route, in the cover's chapter list, and in
 * the linear view.
 */
export function pathsForChapter(caseFile: string, slug: string): string[] {
  return [`/work/${caseFile}/${slug}`, `/work/${caseFile}`, `/work/${caseFile}/all`];
}

/** A prose page, by its `page_sections.page` key ("about", "about/philosophy", …). */
export function pathsForPage(pageKey: string): string[] {
  return [`/${pageKey.replace(/^\/+|\/+$/g, "")}`];
}

/**
 * The final list: sorted, deduplicated, and — when anything was written —
 * the two pages that list case files (`/` and `/work`). An empty collection
 * stays empty: a run that wrote nothing has nothing to invalidate.
 */
export function finalizeRevalidatePaths(collected: Iterable<string>): string[] {
  const set = new Set(collected);
  if (set.size > 0) {
    set.add("/");
    set.add("/work");
  }
  for (const p of set) {
    if (!p.startsWith("/") || /^\/(en|ar)(\/|$)/.test(p)) {
      throw new Error(`revalidate path must be locale-agnostic and start with "/": ${p}`);
    }
  }
  return [...set].sort();
}

/** `REVALIDATE_URLS` → base URLs, trimmed, trailing slashes removed, empties dropped. */
export function parseRevalidateUrls(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter((s) => s.length > 0);
}

export type RevalidateOutcome = { base: string; ok: boolean; detail: string };

/**
 * One POST per base. Never throws: every failure comes back as `ok: false`
 * with a reason, so the caller can report a NOTICE rather than fail the sync.
 * The secret is sent in the body and never appears in `detail`.
 */
export async function postRevalidate(
  base: string,
  secret: string,
  paths: readonly string[],
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 15000,
): Promise<RevalidateOutcome> {
  const url = `${base}/api/revalidate`;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, paths }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    if (!res.ok) return { base, ok: false, detail: `HTTP ${res.status} ${text.slice(0, 300)}` };
    let count: number | null = null;
    try {
      const json = JSON.parse(text) as { revalidated?: unknown };
      if (Array.isArray(json.revalidated)) count = json.revalidated.length;
    } catch {
      /* body not JSON; report status only */
    }
    return {
      base,
      ok: true,
      detail: `HTTP ${res.status}${count === null ? "" : `, ${count} localised route(s) revalidated`}`,
    };
  } catch (err) {
    return { base, ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}
