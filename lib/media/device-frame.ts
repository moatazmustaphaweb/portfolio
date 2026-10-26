/**
 * Which phone a chapter's portrait screenshots are framed in.
 *
 * Decided by Moataz, task `003221026`: it is AUTHORED, per chapter, as the
 * Notion property `Device` on the chapter page — not inferred from the image,
 * the route or the folder a public_id sits in. Stored in `chapters.device_frame`
 * (migration 0062). This file is the one vocabulary both the sync and the
 * content layer read, so the two cannot drift.
 *
 * The default is `iphone`, because that is what an empty `Device` means by
 * decision — not because it is a guess. An unrecognised value is defaulted too,
 * but the sync REPORTS it (see `lib/sync/device-frame.ts`); only the content
 * layer defaults silently, and only for a NULL or a column that is not there
 * yet, which the database's own default and CHECK make unreachable once 0062
 * is applied.
 */

export const DEVICE_FRAMES = ["iphone", "android"] as const;

export type DeviceFrame = (typeof DEVICE_FRAMES)[number];

export const DEFAULT_DEVICE_FRAME: DeviceFrame = "iphone";

export function isDeviceFrame(value: unknown): value is DeviceFrame {
  return typeof value === "string" && (DEVICE_FRAMES as readonly string[]).includes(value);
}

/**
 * A stored `chapters.device_frame` → the frame to render.
 *
 * Accepts `unknown` on purpose: before 0062 is applied, `select("*")` simply
 * does not return the column, and the page must still render — with the
 * default, which is what every chapter showed before the column existed.
 */
export function deviceFrameOrDefault(value: unknown): DeviceFrame {
  return isDeviceFrame(value) ? value : DEFAULT_DEVICE_FRAME;
}
