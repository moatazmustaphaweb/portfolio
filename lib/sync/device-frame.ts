/**
 * The Notion `Device` property on a chapter row → `chapters.device_frame`.
 *
 * Pure, so `scripts/test-sync-logic.ts` can prove it without credentials.
 * Task `003221026`; migration 0062.
 *
 * The rule, as decided: `Android` → `android`; empty → `iphone`. Matching is
 * case-insensitive and trims, because a select option and a typed value are
 * both legitimate ways to author it and neither should fail on `android ` or
 * `ANDROID`.
 *
 * ⚠️ AN UNRECOGNISED VALUE IS DEFAULTED AND REPORTED, NEVER JUST DEFAULTED.
 * `Pixel`, `iOS`, `Samsung` all render an iPhone frame, and each one produces
 * a notice naming the chapter and the value. Absence is invisible on this
 * project (docs/learn.md Part 5): a typo in Notion that silently shipped the
 * wrong phone would look exactly like a correct `iPhone`.
 */

import { DEFAULT_DEVICE_FRAME, type DeviceFrame } from "@/lib/media/device-frame";

/** What the property held, before any decision is made about it. */
export type DeviceRead =
  /** The database has no `Device` property at all. */
  | { state: "absent" }
  /** The property exists and this row leaves it empty. */
  | { state: "empty" }
  | { state: "value"; value: string }
  /** The property exists but is a type this reader does not understand. */
  | { state: "unsupported"; type: string };

type RichText = { plain_text?: string }[] | undefined;

function joinText(parts: RichText): string {
  return (parts ?? []).map((t) => t.plain_text ?? "").join("").trim();
}

/**
 * Read a Notion property value of any of the shapes `Device` might be given:
 * `select`, `status`, `multi_select`, `rich_text`, or `title`.
 *
 * A `multi_select` with several options is joined with ", " so it arrives as a
 * value nobody recognises and is REPORTED — choosing one of two would be
 * exactly the inference this reader exists to refuse.
 */
export function readDeviceProperty(prop: unknown): DeviceRead {
  if (prop === undefined || prop === null) return { state: "absent" };

  const p = prop as {
    type?: string;
    select?: { name?: string } | null;
    status?: { name?: string } | null;
    multi_select?: { name?: string }[];
    rich_text?: RichText;
    title?: RichText;
  };

  let value: string;
  switch (p.type) {
    case "select":
      value = (p.select?.name ?? "").trim();
      break;
    case "status":
      value = (p.status?.name ?? "").trim();
      break;
    case "multi_select":
      value = (p.multi_select ?? []).map((o) => (o.name ?? "").trim()).filter(Boolean).join(", ");
      break;
    case "rich_text":
      value = joinText(p.rich_text);
      break;
    case "title":
      value = joinText(p.title);
      break;
    default:
      return { state: "unsupported", type: String(p.type ?? "unknown") };
  }

  return value ? { state: "value", value } : { state: "empty" };
}

/**
 * The frame to store, and — when the value was not one of the two — the
 * problem to report. `problem` is null for every case that is correct by
 * decision: `iPhone`, `Android`, empty, and a property not yet on the database.
 */
export function resolveDeviceFrame(read: DeviceRead): {
  frame: DeviceFrame;
  problem: string | null;
} {
  switch (read.state) {
    case "absent":
    case "empty":
      return { frame: DEFAULT_DEVICE_FRAME, problem: null };
    case "unsupported":
      return {
        frame: DEFAULT_DEVICE_FRAME,
        problem:
          `Device is a "${read.type}" property, expected select or text; ` +
          `using ${DEFAULT_DEVICE_FRAME}`,
      };
    case "value": {
      const norm = read.value.toLowerCase();
      if (norm === "android") return { frame: "android", problem: null };
      if (norm === "iphone") return { frame: "iphone", problem: null };
      return {
        frame: DEFAULT_DEVICE_FRAME,
        problem: `Device "${read.value}" is not iPhone/Android; using ${DEFAULT_DEVICE_FRAME}`,
      };
    }
  }
}
