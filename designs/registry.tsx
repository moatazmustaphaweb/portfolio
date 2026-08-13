import type { ReactElement } from "react";

import { EgyptAcquisitionCover } from "@/designs/egypt-acquisition-cover";

/**
 * Component covers — the registry `case_files.cover_component` keys into.
 *
 * The four case file covers are conceptual artwork rather than screenshots,
 * built as inline SVG bound to our tokens. An SVG in an <img> cannot read the
 * page's CSS, so it cannot follow the theme; inlining is what makes the token
 * binding work, and a component is how the markup gets into the page without
 * a build plugin.
 *
 * WHAT LIVES WHERE. The database says *which* cover a case file has
 * (`cover_kind` + `cover_component`); this file says what that key draws. The
 * decision is data, the implementation is code — the same split already used
 * for media, where the `public_id` is data and the transform preset is code.
 *
 * The English strings below are passed at the call site for this pass only.
 * Next session they resolve through the query layer like every other string,
 * and no artwork changes when they do — every label is already a prop.
 */

/** How a cover is sized at each of the two places it renders. */
export type CoverSize = "card" | "cover";

type CoverRenderer = (size: CoverSize) => ReactElement;

const COVERS: Record<string, CoverRenderer> = {
  "egypt-acquisition": () => (
    <EgyptAcquisitionCover
      className="h-auto w-full"
      uid="egypt-acquisition-cover"
      title="EGYPT ACQUISITION"
      systemKicker="//SYSTEM"
      /*
       * The four published chapters, verified against the database, split
       * across the two bands exactly as the reference splits them. Not the
       * reference's nine: the other five are not in the database, and one of
       * them asserts "LIVE", which decision 007 does not support for Egypt.
       */
      bands={[
        {
          label: "SYSTEM A — CUSTOMER-FACING",
          systems: ["ONBOARDING JOURNEY", "CUSTOMER PORTAL & NOTIFICATIONS"],
        },
        {
          label: "SYSTEM B — BANK-FACING",
          systems: ["APPLICATION WORKFLOW", "FULFILMENT & AOF"],
        },
      ]}
      alt="Egypt Acquisition — system map"
      description="A schematic of the programme in two bands: the customer-facing systems, Onboarding Journey and Customer Portal & Notifications; and the bank-facing systems, Application Workflow and Fulfilment & AOF."
    />
  ),
};

/**
 * Resolve a `cover_component` key to its artwork.
 *
 * Throws rather than returning null, for the reason `assertNotRedacted`
 * throws: a silently-dropped cover looks like a missing image and gets
 * ignored, while a thrown error gets fixed. A key in the database with no
 * component behind it is a deploy that shipped without its artwork, and that
 * should stop the page rather than quietly render a gap.
 */
export function resolveCover(key: string, size: CoverSize): ReactElement {
  const cover = COVERS[key];
  if (!cover) {
    throw new Error(
      `case_files.cover_component = "${key}" has no component in designs/registry.tsx. ` +
        `Known keys: ${Object.keys(COVERS).join(", ") || "(none)"}. ` +
        "Either the key is wrong or the artwork was not deployed with the row.",
    );
  }
  return cover(size);
}
