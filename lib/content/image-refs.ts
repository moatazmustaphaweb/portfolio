/**
 * `[image:<uuid>]` — the reference that survives the trip through the database.
 *
 * The sync reads a tag from the Notion body, creates a `media` row, and writes
 * `[image:<media.id>]` in place of the tag in the copy stored in `translations`.
 * Notion itself is never rewritten: the public ID, alt and caption stay there
 * exactly as authored.
 *
 * THE UUID, NOT THE PUBLIC ID, IS WHAT GETS STORED. That is the point of the
 * indirection. Cloudinary folders were renamed in the UI after upload — which
 * does not change a public ID — and every ID in the old inventory went stale in
 * one move. A UUID is stable against renames, against re-uploads, and against
 * the public ID turning out to contain a character something downstream dislikes.
 *
 * Both halves of the agreement live in this file, so a change to the marker
 * cannot be made on one side only.
 */

/**
 * Matches the marker anywhere in a body of text.
 *
 * Deliberately loose on the UUID (hex and hyphens, 36 chars) rather than a
 * strict RFC 4122 pattern: the value is one we wrote ourselves from a database
 * primary key, and a stricter regex here would fail closed on a valid id for no
 * benefit. The resolver treats an id it cannot find as a missing image anyway.
 */
export const IMAGE_REF = /\[image:([0-9a-fA-F-]{36})\]/g;

/** The marker for one media row. The only place this string is constructed. */
export function formatImageRef(mediaId: string): string {
  return `[image:${mediaId}]`;
}

export type BodyPart =
  | { kind: "text"; text: string }
  | { kind: "image"; mediaId: string };

/**
 * Split stored body text into prose runs and image references, in order.
 *
 * In practice a tag is alone in its paragraph, so most calls return either one
 * `text` part or one `image` part. The general split is implemented anyway
 * because the cost is a few lines and the alternative — assuming the whole
 * string is a marker — would silently drop prose the day a tag is written
 * mid-paragraph.
 *
 * Empty and whitespace-only text runs are dropped: they are the seams left
 * either side of a marker, not content.
 */
export function splitBody(body: string): BodyPart[] {
  const parts: BodyPart[] = [];
  let last = 0;

  // A fresh regex per call — /g carries lastIndex, and a shared instance would
  // make this function's result depend on who called it previously.
  const re = new RegExp(IMAGE_REF.source, "g");

  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const before = body.slice(last, m.index);
    if (before.trim()) parts.push({ kind: "text", text: before.trim() });
    parts.push({ kind: "image", mediaId: m[1] });
    last = m.index + m[0].length;
  }

  const rest = body.slice(last);
  if (rest.trim()) parts.push({ kind: "text", text: rest.trim() });

  return parts;
}

/** Every media id referenced by a body, in order, deduplicated. */
export function referencedMediaIds(bodies: readonly string[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const body of bodies) {
    for (const part of splitBody(body)) {
      if (part.kind === "image" && !seen.has(part.mediaId)) {
        seen.add(part.mediaId);
        ids.push(part.mediaId);
      }
    }
  }
  return ids;
}
