/**
 * Case File Cover — Egypt Acquisition (Web).
 *
 * Adapted from `Case File Cover - Egypt Acquisition (Web).dc.html` in Claude
 * Design project 3e8bfb82. The reference is a source, not a target: what
 * carries over is the schematic language — monospace, hairline plates, corner
 * registration marks, a banded system map. What does not carry over is
 * documented at the bottom of this file and in docs/decisions.md.
 *
 * WHY THIS IS A COMPONENT AND NOT A CLOUDINARY ASSET
 * An SVG inside an <img> is an isolated document. It cannot read the page's
 * CSS, so no --color-* variable resolves and the artwork cannot follow the
 * theme. Token binding and Cloudinary delivery are mutually exclusive, and
 * token binding won. The markup therefore has to be *in* the page — which is
 * what a React component gives us, with no build plugin and no new dependency.
 *
 * EVERY COLOUR IS A TOKEN. There is not one hex literal below. The artwork
 * inverts with the theme because the tokens do, with no JavaScript and no
 * second light-mode file.
 *
 * NO TEXT IS HARDCODED. Every string arrives as a prop (rule 1). The Arabic
 * pass is therefore a call-site change and never touches this file.
 */

/** One band of the map: a heading, and the two systems that sit under it. */
export type CoverBand = {
  /** e.g. "SYSTEM A — CUSTOMER-FACING". */
  label: string;
  /** Exactly two. The geometry is fixed; see the note on reflow below. */
  systems: readonly [string, string];
};

export type EgyptAcquisitionCoverProps = {
  /** The case file name, set across the top plate. */
  title: string;
  /** Exactly two bands. */
  bands: readonly [CoverBand, CoverBand];
  /** The mono kicker repeated on every system plate, e.g. "//SYSTEM". */
  systemKicker: string;
  /** Accessible name for the whole artwork — what a screen reader announces. */
  alt: string;
  /** Read after the name. What the diagram actually shows. */
  description: string;
  /**
   * Disambiguates the <title>/<desc> ids when more than one cover is on a
   * page. Defaults to the slug this artwork belongs to.
   */
  uid?: string;
  className?: string;
};

/*
 * GEOMETRY — one coordinate system, fixed, 2:1.
 *
 * The viewBox is the entire responsive strategy: the artwork scales from a
 * 280px gallery card to a full-width cover without a single media query and
 * without reflowing into a second composition. At card size the type is below
 * reading size and the piece reads as a schematic texture; at cover width it
 * resolves into a legible map. That is exactly how the reference behaves — its
 * own runtime scales a 1600px board down to its container.
 *
 * SYMMETRY IS THE RTL STRATEGY. Every element is either centred or placed as
 * one of a mirror-image pair, so the composition is unchanged under
 * reflection. It does not need mirroring for /ar, which is what was asked for
 * — rather than being mirrored, it is built not to require it.
 */
const W = 1600;
const H = 800;
const PAD_X = 56;
const INNER_W = W - PAD_X * 2; // 1488

const TITLE_Y = 56;
const TITLE_H = 112;
const ACCENT_H = 3;

const LABEL_H = 48;
const CARD_H = 156;
const CARD_GAP = 24;
const CARD_W = (INNER_W - CARD_GAP) / 2; // 732
const CARD_X = [PAD_X, PAD_X + CARD_W + CARD_GAP] as const; // 56, 812

/** Top of each band's label plate, and of its pair of system plates. */
const BAND_Y = [
  { label: 200, cards: 272 },
  { label: 512, cards: 584 },
] as const;

const DIVIDER_Y = 470;

/** Corner registration marks — the reference draws these as "+" glyphs. Drawn
 *  as strokes here so they carry no font dependency into a raster export. */
function Registration({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const arm = 7;
  const corners = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ] as const;
  return (
    <g stroke="var(--color-fg-dim)" strokeWidth={1}>
      {corners.map(([cx, cy]) => (
        <path key={`${cx}-${cy}`} d={`M${cx - arm} ${cy}h${arm * 2}M${cx} ${cy - arm}v${arm * 2}`} />
      ))}
    </g>
  );
}

/** A hairline plate. One stroke weight, one surface step, no shadow. */
function Plate({ x, y, w, h, raised }: { x: number; y: number; w: number; h: number; raised?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill={raised ? "var(--color-surface-raised)" : "var(--color-surface)"}
      stroke="var(--color-border)"
      strokeWidth={1}
    />
  );
}

export function EgyptAcquisitionCover({
  title,
  bands,
  systemKicker,
  alt,
  description,
  uid = "egypt-acquisition-cover",
  className,
}: EgyptAcquisitionCoverProps) {
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const gridId = `${uid}-grid`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      /*
       * The artwork carries meaning — it is the shape of the programme — so it
       * is labelled rather than hidden. Name first, description second.
       */
      xmlns="http://www.w3.org/2000/svg"
      /*
       * Mono, because the whole language is mono. Arabic never uses
       * --font-mono: the :lang(ar) fallback to --font-arabic-body at
       * letter-spacing normal is a globals.css concern, so the Arabic pass
       * still does not touch this file.
       */
      fontFamily="var(--font-mono)"
    >
      <title id={titleId}>{alt}</title>
      <desc id={descId}>{description}</desc>

      {/* ---- ground + measure lattice (decorative) ---- */}
      <g aria-hidden="true">
        <rect width={W} height={H} fill="var(--color-surface)" />
        <defs>
          <pattern id={gridId} width={56} height={56} patternUnits="userSpaceOnUse">
            <path d="M56 0H0V56" fill="none" stroke="var(--color-border)" strokeWidth={1} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${gridId})`} opacity={0.5} />
      </g>

      {/* ---- title plate ---- */}
      <g>
        <Plate x={PAD_X} y={TITLE_Y} w={INNER_W} h={TITLE_H} raised />
        <Registration x={PAD_X} y={TITLE_Y} w={INNER_W} h={TITLE_H} />
        <text
          x={W / 2}
          y={TITLE_Y + 72}
          textAnchor="middle"
          fontSize={46}
          letterSpacing={8}
          fill="var(--color-fg)"
        >
          {title}
        </text>
      </g>

      {/*
        The accent, used exactly once in the whole artwork, as the title
        plate's baseline rule. It is an underline paired with the title, never
        the sole indicator of anything (tokens.md, COLOUR rule 2).
      */}
      <rect
        aria-hidden="true"
        x={PAD_X}
        y={TITLE_Y + TITLE_H}
        width={INNER_W}
        height={ACCENT_H}
        fill="var(--color-accent)"
      />

      {/* ---- the two bands ---- */}
      {bands.map((band, b) => {
        const { label, cards } = BAND_Y[b];
        return (
          <g key={label}>
            <Plate x={PAD_X} y={label} w={INNER_W} h={LABEL_H} />
            <text
              x={W / 2}
              y={label + 30}
              textAnchor="middle"
              fontSize={16}
              letterSpacing={4}
              fill="var(--color-fg-muted)"
            >
              {band.label}
            </text>

            {band.systems.map((system, s) => (
              <g key={system}>
                <Plate x={CARD_X[s]} y={cards} w={CARD_W} h={CARD_H} raised />
                <Registration x={CARD_X[s]} y={cards} w={CARD_W} h={CARD_H} />
                <text
                  x={CARD_X[s] + CARD_W / 2}
                  y={cards + 52}
                  textAnchor="middle"
                  fontSize={16}
                  letterSpacing={2.4}
                  fill="var(--color-fg-dim)"
                >
                  {systemKicker}
                </text>
                <text
                  x={CARD_X[s] + CARD_W / 2}
                  y={cards + 108}
                  textAnchor="middle"
                  fontSize={30}
                  letterSpacing={2.4}
                  fill="var(--color-fg)"
                >
                  {system}
                </text>
              </g>
            ))}
          </g>
        );
      })}

      {/* ---- the two bands are peers, separated by a hairline, not a fill ---- */}
      <path
        aria-hidden="true"
        d={`M${PAD_X} ${DIVIDER_Y}H${W - PAD_X}`}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
      />
    </svg>
  );
}

/*
 * WHAT THE REFERENCE HAD THAT OUR TOKENS DO NOT, AND WHAT REPLACED IT
 *
 * 1. FOUR SIGNAL HUES — #B8453D red, #C9772F orange, #C9A83A gold, #5FA84B
 *    green — driving rows of small skewed chips, some faded, on every plate.
 *    Removed outright, not recoloured. Three reasons, any one sufficient:
 *      · four new hues, where the palette is one accent (tokens.md);
 *      · a red-to-green ramp is a status encoding, and this site does not
 *        signal urgency by colour — decision 042 removed red from the results
 *        table for the same reason;
 *      · a row of "three filled, one faded" chips reads as "3 of 4", and no
 *        such figure exists in the database. Collapsing four hues into one
 *        would still have published an unbacked metric, so the chips are gone
 *        rather than restyled (rule 7).
 *
 * 2. GRADIENT PLATE FILLS, rgba(255,255,255,0.05) → 0.012. The system has no
 *    gradient token and depth is "a 1px border plus a surface step" (COLOUR
 *    rule 4). Replaced by --color-surface-raised against --color-surface.
 *
 * 3. IBM PLEX MONO. Replaced by --font-mono (Geist Mono). No webfont enters
 *    the artwork; it inherits the site's.
 *
 * 4. #0A0A0A GROUND. This is exactly --color-surface in dark, so the artwork
 *    keeps the reference's ground and gains a light theme for free.
 *
 * WHAT CHANGED FOR DIRECTION-NEUTRALITY
 *
 * 5. The title was right-aligned (justify-content:flex-end) — an LTR anchor.
 *    Centred.
 *
 * 6. The 108px vertical rail carrying "SYSTEM A / CUSTOMER-FACING" in rotated
 *    type sat on the left of every band, where RTL would want it on the right.
 *    Replaced by a full-width horizontal label plate above each band, which is
 *    symmetric, and which is also legible at gallery-card scale where rotated
 *    13px type is not.
 *
 * 7. The reference staggers its plates on a descending left-to-right diagonal
 *    (cols 2/4, then 3/5, then 4/7) against a six-phase strip — a Gantt, and
 *    a Gantt reads right-to-left in Arabic. Replaced by mirror-image pairs.
 *    Nothing was lost: the diagonal carried no data, and the plate spans in
 *    the reference are illustrative (decision 021 — the design files carry
 *    dummy content).
 *
 * 8. The six-cell phase strip — DISCOVERY / STRUCTURE / REVIEW / EXCEPTION /
 *    PORTAL / CLOSE — is dropped. No such content exists in the database, so
 *    rendering it would invent six programme phases; and it is inherently a
 *    left-to-right sequence. The six-column measure survives as the lattice.
 *
 * 9. The reference names nine systems. Four of them — Onboarding Journey,
 *    Application Workflow, Customer Portal & Notifications, Fulfilment & AOF —
 *    are Egypt's real published chapters, and they fall into the same two
 *    bands the reference puts them in. The other five, including the plate
 *    reading "SIX SYSTEMS, LIVE", are not in the database; "LIVE" would also
 *    contradict decision 007, which holds Egypt at controlled release. The
 *    call site passes the four verified names.
 */
