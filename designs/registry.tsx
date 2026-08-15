import type { ReactElement } from "react";

import {
  EgyptAcquisitionCover,
  type CoverSize,
  type PhaseDirection,
} from "@/designs/egypt-acquisition-cover";
import { UaeAcquisitionCover } from "@/designs/uae-acquisition-cover";

/**
 * Component covers — the registry `case_files.cover_component` keys into.
 *
 * The four case file covers are conceptual artwork depicting each programme's
 * system landscape, built as inline SVG bound to our tokens. An SVG in an
 * <img> cannot read the page's CSS, so it cannot follow the theme; inlining is
 * what makes the token binding work, and a component is how the markup gets
 * into the page without a build plugin (decision 049).
 *
 * WHAT LIVES WHERE. The database says *which* cover a case file has
 * (`cover_kind` + `cover_component`); this file says what that key draws. The
 * decision is data, the implementation is code — the same split already used
 * for media, where the `public_id` is data and the transform preset is code.
 *
 * THE LABELS ARE NOT DATABASE ROWS AND ARE NOT MEANT TO BE. This artwork
 * depicts the real programme: its delivery phases and the systems that ran
 * across them. Several of these systems were merged into fewer published
 * chapters (decision 006), so the map is deliberately finer-grained than the
 * chapter list. Moataz is the source for these names.
 *
 * The English strings below are passed here for this pass only. Next session
 * they resolve through the query layer, and no artwork changes when they do —
 * every label is already a prop.
 */

export type { CoverSize };

const COVERS: Record<string, (size: CoverSize) => ReactElement> = {
  "egypt-acquisition": (size) => (
    <EgyptAcquisitionCover
      className="h-auto w-full"
      uid="egypt-acquisition-cover"
      size={size}
      /*
       * The phase axis runs left-to-right, which does not survive dir="rtl" by
       * reflection. "rtl" mirrors the column axis only — phases right-to-left,
       * spans mirrored, rail on the right, text never flipped. Left at "ltr"
       * until the direction question is settled; this pass renders English
       * labels in both locales, so nothing turns on it yet.
       */
      phaseDirection={"ltr" satisfies PhaseDirection}
      title="EGYPT ACQUISITION"
      taskMarker="//TASK"
      phases={["DISCOVERY", "STRUCTURE", "REVIEW", "EXCEPTION", "PORTAL", "CLOSE"]}
      bands={[
        {
          label: "SYSTEM A   CUSTOMER-FACING",
          plates: [
            "ONBOARDING JOURNEY",
            "DOCUMENT CAPTURE & OCR",
            "CUSTOMER PORTAL & NOTIFICATIONS",
            "ACCOUNT ACTIVATION",
          ],
        },
        {
          label: "SYSTEM B   BANK-FACING",
          plates: [
            "APPLICATION WORKFLOW",
            "NAME SCREENING",
            "EXCEPTION HANDLING",
            "FULFILMENT & AOF",
            "SIX SYSTEMS, LIVE",
          ],
        },
      ]}
      alt="Egypt Acquisition — programme system map"
      description="A matrix of the Egypt Acquisition programme across six delivery phases — Discovery, Structure, Review, Exception, Portal and Close. The customer-facing band carries Onboarding Journey, Document Capture & OCR, Customer Portal & Notifications, and Account Activation. The bank-facing band carries Application Workflow, Name Screening, Exception Handling, Fulfilment & AOF, and closes on six systems live. Each plate spans the phases its system operates across, so overlapping plates show systems running concurrently."
    />
  ),

  /*
   * UAE Acquisition — Moataz's own artwork, from `designs/OBJECTS.svg`
   * (2026-08-15). Replaces the generated point-cloud portrait entirely; that
   * component's file is kept on disk, unreferenced, pending his decision.
   *
   * The geometry is his, verbatim — see the component. Only colour changed,
   * onto tokens (decision 049), and the export's 9 embedded rasters were
   * dropped with his approval, since pixels cannot take a token.
   *
   * UAE is nda = true and decision 050 applies: every PNG was decoded and
   * viewed before conversion — a facial-recognition mesh, no screen geometry
   * and no interface fragments — so the artwork has no NDA surface, and the
   * badge on the card carries the signal.
   *
   * The alt and description below are rewritten for THIS artwork. They
   * described the point cloud's dots, circuit traces and padlocks, none of
   * which exist here; a screen reader would have announced a picture that is
   * not on the page. They resolve through translations next pass.
   */
  "uae-acquisition": () => (
    <UaeAcquisitionCover
      className="h-auto w-full"
      uid="uae-acquisition-cover"
      alt="UAE Acquisition — facial recognition mesh"
      description="A frontal human face rendered as a low-polygon wireframe mesh: flat planes bounded by fine lines, following the brow, eye sockets, the bridge and length of the nose, the lips and the line of the jaw. A horizontal scanning beam crosses the face at eye level, marked at each end by a small filled circle — the moment of capture, in a biometric identity check."
    />
  ),
};

/**
 * Resolve a `cover_component` key to its artwork.
 *
 * Throws rather than returning null, for the reason `assertNotRedacted`
 * throws: a silently-dropped cover looks like a missing image and gets
 * ignored, while a thrown error gets fixed. A key in the database with no
 * component behind it is a deploy that shipped without its artwork.
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
