/**
 * The Notion `Image layout` property on a chapter row → `chapters.image_layout`.
 *
 * Pure, so `scripts/test-sync-logic.ts` can prove it without credentials.
 * Task `004221026`; migration 0063. Mirrors `lib/sync/device-frame.ts`.
 *
 * The rule, as decided: `Grid` → `grid`; `Stacked` → `stacked`; `Editorial`
 * → `editorial` (decision 068, task `012261026`, migration 0066); empty →
 * `stacked`. Matching is case-insensitive and trims.
 *
 * ⚠️ AN UNRECOGNISED VALUE IS DEFAULTED AND REPORTED, NEVER JUST DEFAULTED.
 * `Carousel`, `Gird`, two multi-select options all render stacked, and each one
 * produces a notice naming the chapter and the value. Absence is invisible on
 * this project (docs/learn.md Part 5).
 */

import { DEFAULT_IMAGE_LAYOUT, type ImageLayout } from "@/lib/media/image-layout";

/*
 * The property READER is shared with `Device`: it decides nothing, only which
 * of absent / empty / value / unsupported-type the Notion property holds, and
 * it reads select, status, multi_select, rich_text and title alike. One reader
 * means the two chapter properties cannot drift in what shapes they tolerate.
 */
import { readDeviceProperty, type DeviceRead } from "./device-frame";

/** What the property held, before any decision is made about it. */
export type ImageLayoutRead = DeviceRead;

/** Read the `Image layout` property value. Same tolerance as `Device`. */
export function readImageLayoutProperty(prop: unknown): ImageLayoutRead {
  return readDeviceProperty(prop);
}

/**
 * The layout to store, and — when the value was not one of the three — the
 * problem to report. `problem` is null for every case that is correct by
 * decision: `Stacked`, `Grid`, `Editorial`, empty, and a property not yet on
 * the database.
 */
export function resolveImageLayout(read: ImageLayoutRead): {
  layout: ImageLayout;
  problem: string | null;
} {
  switch (read.state) {
    case "absent":
    case "empty":
      return { layout: DEFAULT_IMAGE_LAYOUT, problem: null };
    case "unsupported":
      return {
        layout: DEFAULT_IMAGE_LAYOUT,
        problem:
          `Image layout is a "${read.type}" property, expected select or text; ` +
          `using ${DEFAULT_IMAGE_LAYOUT}`,
      };
    case "value": {
      const norm = read.value.toLowerCase();
      if (norm === "grid") return { layout: "grid", problem: null };
      if (norm === "stacked") return { layout: "stacked", problem: null };
      if (norm === "editorial") return { layout: "editorial", problem: null };
      return {
        layout: DEFAULT_IMAGE_LAYOUT,
        problem: `Image layout "${read.value}" is not Stacked/Grid/Editorial; using ${DEFAULT_IMAGE_LAYOUT}`,
      };
    }
  }
}
