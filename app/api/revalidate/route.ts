import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { LOCALES } from "@/lib/content/types";

/**
 * ISR cache invalidation. Called after a publish (by the sync script now, by
 * the admin panel in Layer 4).
 *
 * POST /api/revalidate
 *   { "secret": "…", "paths": ["/work/egypt-acquisition"] }
 *
 * Paths are locale-agnostic: pass `/work/x` and both `/en/work/x` and
 * `/ar/work/x` are invalidated. Forgetting the Arabic route is the obvious
 * failure here, so the caller is not trusted to remember it.
 *
 * Tag-based invalidation is deliberately not supported. Next 16's
 * `revalidateTag` requires a cache-life profile and is designed around
 * `"use cache"`, which this codebase does not use — path invalidation is the
 * correct primitive for ISR. Revisit if we adopt `"use cache"`.
 */

export const dynamic = "force-dynamic";

type RevalidateBody = {
  secret?: unknown;
  paths?: unknown;
};

function asStringArray(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;
  if (!value.every((v): v is string => typeof v === "string")) return null;
  return value;
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    // Fail closed. A missing secret must never mean "open to everyone".
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.secret !== "string" || body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = asStringArray(body.paths);

  if (paths === null) {
    return NextResponse.json(
      { error: "`paths` must be an array of strings" },
      { status: 400 },
    );
  }

  if (paths.length === 0) {
    return NextResponse.json(
      { error: "Nothing to revalidate: provide `paths`" },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];

  for (const path of paths) {
    if (!path.startsWith("/")) {
      return NextResponse.json(
        { error: `Path must start with "/": ${path}` },
        { status: 400 },
      );
    }
    for (const locale of LOCALES) {
      const localised = `/${locale}${path === "/" ? "" : path}`;
      revalidatePath(localised);
      revalidated.push(localised);
    }
  }

  return NextResponse.json({ revalidated, at: new Date().toISOString() });
}
