/**
 * Media dimensions from Cloudinary — the pure half (task `007231026`).
 *
 * The sync creates `media` rows from `[cld]` tags, and until this task it wrote
 * them with NULL `width` / `height`. A figure with no dimensions renders with no
 * device frame, because the frame is chosen from the picture's own aspect ratio.
 * Migrations 0060 and 0061 backfilled by hand; this replaces the hand step.
 *
 * Source: Cloudinary's public delivery API with the `fl_getinfo` flag —
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/fl_getinfo/<public_id>
 *
 * — which needs no credentials and returns JSON whose `input` is the ORIGINAL
 * asset and whose `output` is the derived one. `input` is what `media.width` /
 * `media.height` describe.
 *
 * Everything here is pure so `npm run test:sync` can cover it without a
 * network. The fetch, the cache and the database write live in
 * `scripts/sync-notion.ts`.
 */

export type Dimensions = { width: number; height: number };

/** What a `media` row currently holds. `null` means no row exists yet. */
export type StoredDimensions = { width: number | null; height: number | null } | null;

/**
 * The `fl_getinfo` URL for a public ID.
 *
 * Public IDs are stored verbatim (spaces, dots, parentheses, apostrophes — see
 * the contract, Step 6). Storage is not a URL, so encoding happens here and
 * only here: each path segment is percent-encoded and the slashes between
 * segments are kept, because they are part of the ID's folder path.
 */
export function getinfoUrl(cloudName: string, publicId: string): string {
  const path = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/fl_getinfo/${path}`;
}

const isPositiveInt = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v > 0;

/**
 * Read the original's dimensions out of an `fl_getinfo` response body.
 *
 * Accepts only `input.width` and `input.height` as positive integers. Anything
 * else — missing `input`, `output` only, strings, zero, fractions — is an error
 * with a reason, never a guess. `output` is deliberately NOT a fallback: it
 * describes a derived image, and writing its size onto the row would be a
 * plausible number that is wrong.
 */
export function parseGetinfo(body: unknown): Dimensions | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "response is not a JSON object" };
  }
  const input = (body as { input?: unknown }).input;
  if (typeof input !== "object" || input === null) {
    return { error: "response has no `input` object" };
  }
  const { width, height } = input as { width?: unknown; height?: unknown };
  if (!isPositiveInt(width) || !isPositiveInt(height)) {
    return {
      error: `\`input\` does not carry positive integer width/height (got ${JSON.stringify({ width, height })})`,
    };
  }
  return { width, height };
}

/** Does this row need dimensions fetched? A new row, or either column NULL. */
export function needsDimensions(stored: StoredDimensions): boolean {
  return stored === null || stored.width === null || stored.height === null;
}

/**
 * The patch to write: only the columns that are NULL now.
 *
 * NEVER OVERWRITES a non-NULL dimension. A value already on the row was put
 * there on purpose — a hand backfill (0060, 0061) or an earlier run — and a
 * re-upload at a different size is a decision to re-read, not something the
 * sync infers. Returns `null` when there is nothing to write.
 */
export function dimensionPatch(
  stored: StoredDimensions,
  fetched: Dimensions,
): Partial<Dimensions> | null {
  const patch: Partial<Dimensions> = {};
  if (stored === null || stored.width === null) patch.width = fetched.width;
  if (stored === null || stored.height === null) patch.height = fetched.height;
  return Object.keys(patch).length > 0 ? patch : null;
}
