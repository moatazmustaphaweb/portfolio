/**
 * Case File Cover — Egypt Acquisition (Web).
 *
 * Rebuilt from `Case File Cover - Egypt Acquisition (Web).dc.html` in Claude
 * Design project 3e8bfb82, reproducing its matrix exactly.
 *
 * WHAT THIS IS. A visual depiction of the programme's system landscape — a
 * 2×6 matrix of two system bands against six delivery phases. The plate spans
 * ARE the information: they show which system operates across which phases,
 * and where systems overlap. It is not a map of published chapters, not a
 * navigation surface, and not a rendering of database rows. The labels
 * describe the real programme and are Moataz's to state.
 *
 * WHY A COMPONENT AND NOT A CLOUDINARY ASSET. An SVG inside an <img> is an
 * isolated document. It cannot read the page's CSS, so no --color-* resolves
 * and the artwork cannot follow the theme. Token binding and Cloudinary
 * delivery are mutually exclusive, and token binding won (decision 049).
 *
 * EVERY COLOUR IS A TOKEN — not one hex literal below. The reference's four
 * signal hues (#B8453D #C9772F #C9A83A #5FA84B) do not enter the repo; they
 * are carried by the four-step text ramp instead, with the accent used once.
 *
 * NO STRING IS HARDCODED. Title, phases, band labels, plate labels and the
 * task marker are all props, so the Arabic pass is a call-site change that
 * never opens this file.
 */

export type CoverSize = "card" | "cover";

/**
 * Which way the phase axis runs.
 *
 * The matrix reads left-to-right by phase, and that does not survive
 * dir="rtl" by reflection — an Arabic reader taking it as a timeline reads it
 * backwards. "rtl" mirrors the column axis only: phase columns run
 * right-to-left, plate spans mirror with them, the rail moves to the right,
 * and TEXT IS NEVER MIRRORED. That is what an RTL Gantt looks like in Arabic
 * tooling, and it is a pure coordinate change — same composition, no reflow.
 *
 * Defaults to "ltr". This pass renders English labels in both locales, so
 * nothing depends on it yet; the choice lands with the Arabic pass.
 */
export type PhaseDirection = "ltr" | "rtl";

export type CoverBand = {
  /** e.g. "SYSTEM A   CUSTOMER-FACING", set vertically down the rail. */
  label: string;
  /** Labels in matrix order. The spans belong to the artwork, not the caller. */
  plates: readonly string[];
};

export type EgyptAcquisitionCoverProps = {
  title: string;
  /** The six phase columns, in order. */
  phases: readonly [string, string, string, string, string, string];
  /** Band A carries four plates, band B five. */
  bands: readonly [CoverBand, CoverBand];
  /** The mono marker on every plate, e.g. "//TASK". */
  taskMarker: string;
  /** Accessible name — what a screen reader announces. */
  alt: string;
  /** Read after the name. What the matrix shows. */
  description: string;
  size?: CoverSize;
  phaseDirection?: PhaseDirection;
  uid?: string;
  className?: string;
};

/* ─── geometry, all of it from the reference ─────────────────────────────── */

const W = 1600;
const PAD_X = 48;
const PAD_TOP = 44;
const PAD_BOTTOM = 56;
const GAP = 14;
const RAIL_W = 108;
const BLOCK_GAP = 22; // the outer flex column's gap

const CONTENT_W = W - PAD_X * 2; // 1504
/** 108px + repeat(6, minmax(0,1fr)), gap 14 → each phase column. */
const COL_W = (CONTENT_W - RAIL_W - GAP * 6) / 6; // 218.667
const RIGHT_EDGE = W - PAD_X; // 1552

/** Left edge of grid line n, where line 2 is the first phase column. */
function lineX(n: number): number {
  return PAD_X + RAIL_W + GAP + (n - 2) * (COL_W + GAP);
}

/** A CSS `grid-column: a / b` span, in user units. `b = 8` is `-1`. */
function span(a: number, b: number): { x: number; w: number } {
  const x = a === 1 ? PAD_X : lineX(a);
  const right = b >= 8 ? RIGHT_EDGE : lineX(b) - GAP;
  return { x, w: right - x };
}

const TITLE_H = 66;
const TITLE_FS = 36;
const TITLE_LS = 6;
const TITLE_PAD = 26;

const PHASE_H = 38;
const PHASE_FS = 12;
const PHASE_LS = 2.4;

const BAND_TOP_MARGIN = 16;
const DIVIDER_TOP = 14;
const DIVIDER_BOTTOM = 2;

const PLATE_PAD_TOP = 13;
const PLATE_PAD_X = 18;
const PLATE_PAD_BOTTOM = 17;
const PLATE_INNER_GAP = 9;
const META_H = 13;
const MARKER_FS = 11;
const MARKER_LS = 1.6;
const PLATE_FS = 17;
const PLATE_LS = 1.7;
const PLATE_LINE_H = PLATE_FS * 1.4; // 23.8

const CHIP_W = 10;
const CHIP_H = 8;
const CHIP_GAP = 4;
/** skewX(-22deg): the bottom edge shifts left by h·tan(22°). */
const CHIP_SKEW = CHIP_H * Math.tan((22 * Math.PI) / 180);

/**
 * Rail type is smaller than the reference's 13px/3.4. At 13/3.4 the longest
 * band label runs ~291 units against a ~279-unit band height and overflows
 * the rail it sits in. 12/2.8 fits with room.
 */
const RAIL_FS = 12;
const RAIL_LS = 2.8;

/** Geist Mono advance. Monospace makes character-count wrapping exact. */
const MONO_ADVANCE = 0.6;

/**
 * THE ARTWORK SETS ITS OWN DIRECTION. It must not inherit the page's.
 *
 * Under dir="rtl" an SVG's text elements inherit the document direction, and
 * two things break at once — invisibly, because the markup is byte-identical
 * in both locales and only the rendering differs:
 *
 *   · `text-anchor="start"` means "start of the inline base direction", so
 *     every label anchors to the wrong edge and overflows its plate.
 *   · The Unicode bidi algorithm reorders neutral characters. "//TASK" renders
 *     as "TASK//", "SIX SYSTEMS, LIVE" as ".SIX SYSTEMS", and "FULFILMENT &
 *     AOF" as "& FULFILMENT AOF".
 *
 * `direction: ltr` makes the anchors deterministic; `unicode-bidi: isolate`
 * (which does not inherit, so it goes on every text element) stops neutrals
 * leaking between runs. The phase axis is mirrored by `phaseDirection` and by nothing
 * else — layout direction is the artwork's decision, not the page's.
 *
 * ⚠️ When Arabic labels arrive, these want `unicode-bidi: plaintext` so each
 * label takes its base direction from its own first strong character, with the
 * anchor logic re-derived to match. That is a real follow-up, not a detail.
 */
const TEXT_BIDI = { unicodeBidi: "isolate" } as const;

/* ─── the matrix ─────────────────────────────────────────────────────────────
 *
 * Spans, rows, chip counts and ramp steps are the artwork's own — the caller
 * supplies labels in this order and nothing else. Positional, so a relabel
 * (including the Arabic pass) cannot move a plate.
 */
type PlateSpec = {
  /** grid-column start / end. */
  a: number;
  b: number;
  /** 1-indexed grid row within the band. */
  row: number;
  /** Total chips, and how many are filled — the reference's faded last chip. */
  chips: number;
  filled: number;
  /** Which step of the four-step text ramp the chips take. */
  ramp: 0 | 1 | 2 | 3;
  /** The one plate the accent marks. */
  accent?: true;
};

const MATRIX: readonly (readonly PlateSpec[])[] = [
  [
    { a: 2, b: 4, row: 1, chips: 4, filled: 3, ramp: 0 },
    { a: 3, b: 5, row: 2, chips: 3, filled: 2, ramp: 1 },
    { a: 4, b: 7, row: 3, chips: 3, filled: 3, ramp: 2 },
    { a: 7, b: 8, row: 1, chips: 2, filled: 1, ramp: 0 },
  ],
  [
    { a: 2, b: 4, row: 1, chips: 4, filled: 3, ramp: 0 },
    { a: 3, b: 5, row: 2, chips: 3, filled: 2, ramp: 1 },
    { a: 4, b: 7, row: 3, chips: 3, filled: 3, ramp: 2 },
    { a: 6, b: 7, row: 1, chips: 4, filled: 4, ramp: 3 },
    { a: 7, b: 8, row: 1, chips: 2, filled: 1, ramp: 3, accent: true },
  ],
];

const RAMP = [
  "var(--color-fg)",
  "var(--color-fg-body)",
  "var(--color-fg-muted)",
  "var(--color-fg-dim)",
] as const;

/** Greedy wrap. Exact for the Latin monospace face; approximate for Arabic. */
function wrapMono(text: string, boxWidth: number): string[] {
  const advance = PLATE_FS * MONO_ADVANCE + PLATE_LS;
  const max = Math.max(1, Math.floor((boxWidth - PLATE_PAD_X * 2 + PLATE_LS) / advance));
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= max || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const plateHeight = (lines: number) =>
  PLATE_PAD_TOP + META_H + PLATE_INNER_GAP + lines * PLATE_LINE_H + PLATE_PAD_BOTTOM;

/* ─── layout ─────────────────────────────────────────────────────────────── */

function layout(bands: readonly [CoverBand, CoverBand]) {
  const bandRows = MATRIX.map((plates, b) => {
    const rows = [0, 0, 0];
    plates.forEach((p, i) => {
      const label = bands[b].plates[i] ?? "";
      const h = plateHeight(wrapMono(label, span(p.a, p.b).w).length);
      rows[p.row - 1] = Math.max(rows[p.row - 1], h);
    });
    return rows;
  });
  const bandH = bandRows.map((r) => r[0] + GAP + r[1] + GAP + r[2]);

  const titleY = PAD_TOP;
  const phaseY = titleY + TITLE_H + BLOCK_GAP;
  const bandAY = phaseY + PHASE_H + BLOCK_GAP + BAND_TOP_MARGIN;
  const dividerY = bandAY + bandH[0] + BLOCK_GAP + DIVIDER_TOP;
  const bandBY = dividerY + 1 + DIVIDER_BOTTOM + BLOCK_GAP;
  const height = Math.round(bandBY + bandH[1] + PAD_BOTTOM);

  return { bandRows, bandH, titleY, phaseY, bandY: [bandAY, bandBY], dividerY, height };
}

/* ─── pieces ─────────────────────────────────────────────────────────────── */

/** The reference's corner "+" glyphs, drawn as strokes so a raster export
 *  carries no font dependency. `two` renders only top-left and bottom-right,
 *  which is what the phase cells use. */
function Marks({
  x,
  y,
  w,
  h,
  two,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  two?: boolean;
}) {
  const arm = 5;
  const corners = two
    ? ([
        [x, y],
        [x + w, y + h],
      ] as const)
    : ([
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
      ] as const);
  return (
    <g stroke="var(--color-fg-dim)" strokeWidth={1}>
      {corners.map(([cx, cy]) => (
        <path key={`${cx}-${cy}`} d={`M${cx - arm} ${cy}h${arm * 2}M${cx} ${cy - arm}v${arm * 2}`} />
      ))}
    </g>
  );
}

export function EgyptAcquisitionCover({
  title,
  phases,
  bands,
  taskMarker,
  alt,
  description,
  size = "cover",
  phaseDirection = "ltr",
  uid = "egypt-acquisition-cover",
  className,
}: EgyptAcquisitionCoverProps) {
  const L = layout(bands);
  const H = L.height;
  const rtl = phaseDirection === "rtl";

  /* Mirroring the phase axis is a coordinate map over finished boxes: the
   * rail lands on the right, phases run right-to-left, and no glyph flips. */
  const bx = (x: number, w: number) => (rtl ? W - x - w : x);
  const px = (x: number) => (rtl ? W - x : x);
  const anchor = (a: "start" | "middle" | "end") =>
    !rtl || a === "middle" ? a : a === "start" ? "end" : "start";

  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const gridId = `${uid}-lattice`;
  const fadeId = `${uid}-fade`;

  /** A hairline plate. Depth is a border plus a surface step; no shadow. */
  const plate = (x: number, y: number, w: number, h: number, fill: string, stroke?: string) => (
    <rect
      x={bx(x, w)}
      y={y}
      width={w}
      height={h}
      fill={fill}
      stroke={stroke ?? "var(--color-border)"}
      strokeWidth={1}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      xmlns="http://www.w3.org/2000/svg"
      /* Arabic never uses --font-mono; the :lang(ar) fallback to
       * --font-arabic-body at letter-spacing normal is a globals.css rule, so
       * the Arabic pass still does not touch this file. */
      fontFamily="var(--font-mono)"
      /* Not the page's direction — see TEXT_BIDI. */
      style={{ direction: "ltr" }}
    >
      <title id={titleId}>{alt}</title>
      <desc id={descId}>{description}</desc>

      <g aria-hidden="true">
        <rect width={W} height={H} fill="var(--color-bg)" />

        {/* The reference's two 56px linear-gradients, as one pattern.
            On the cover it is a full-frame texture fading at the edges; on a
            gallery thumbnail it would be noise, so there it becomes a frame. */}
        {size === "cover" ? (
          <>
            <defs>
              <pattern id={gridId} width={56} height={56} patternUnits="userSpaceOnUse">
                <path d="M0 0H56M0 0V56" fill="none" stroke="var(--color-border)" strokeWidth={1} />
              </pattern>
              {/*
                The edge fade is a vignette in --color-bg rather than a
                luminance mask, because a mask needs white/black stops and
                those are hex literals by any other name. Painting the ground
                back over the lattice is also what the effect actually is: the
                texture dissolving into the ground it sits on.
              */}
              <radialGradient id={fadeId} cx="50%" cy="50%" r="72%">
                <stop offset="0%" stopColor="var(--color-bg)" stopOpacity={0} />
                <stop offset="62%" stopColor="var(--color-bg)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-bg)" stopOpacity={1} />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill={`url(#${gridId})`} />
            <rect width={W} height={H} fill={`url(#${fadeId})`} />
          </>
        ) : (
          <rect
            x={PAD_X / 2}
            y={PAD_X / 2}
            width={W - PAD_X}
            height={H - PAD_X}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        )}
      </g>

      {/* ── title plate: grid-column 2 / -1 ── */}
      {(() => {
        const s = span(2, 8);
        return (
          <g>
            {plate(s.x, L.titleY, s.w, TITLE_H, "var(--color-surface-raised)")}
            <Marks x={bx(s.x, s.w)} y={L.titleY} w={s.w} h={TITLE_H} />
            <text
              x={px(s.x + s.w - TITLE_PAD)}
              y={L.titleY + TITLE_H / 2 + TITLE_FS * 0.35}
              textAnchor={anchor("end")}
              fontSize={TITLE_FS}
              letterSpacing={TITLE_LS}
              fill="var(--color-fg)"
            
              style={TEXT_BIDI}
            >
              {title}
            </text>
          </g>
        );
      })()}

      {/* ── the six phase columns ── */}
      <g>
        {phases.map((phase, i) => {
          const s = span(2 + i, 3 + i);
          return (
            <g key={phase}>
              {plate(s.x, L.phaseY, s.w, PHASE_H, "var(--color-surface)")}
              <Marks x={bx(s.x, s.w)} y={L.phaseY} w={s.w} h={PHASE_H} two />
              <text
                x={px(s.x + s.w / 2)}
                y={L.phaseY + PHASE_H / 2 + PHASE_FS * 0.35}
                textAnchor="middle"
                fontSize={PHASE_FS}
                letterSpacing={PHASE_LS}
                fill="var(--color-fg-body)"
              
              style={TEXT_BIDI}
            >
                {phase}
              </text>
            </g>
          );
        })}
      </g>

      {/* ── the two system bands ── */}
      {bands.map((band, b) => {
        const y0 = L.bandY[b];
        const rows = L.bandRows[b];
        const rowY = [y0, y0 + rows[0] + GAP, y0 + rows[0] + GAP + rows[1] + GAP];
        const railCx = bx(PAD_X, RAIL_W) + RAIL_W / 2;
        const railCy = y0 + L.bandH[b] / 2;

        return (
          <g key={band.label}>
            {/* the rail — grid-row 1 / span 3, vertical type reading upward */}
            {plate(PAD_X, y0, RAIL_W, L.bandH[b], "var(--color-surface)")}
            <Marks x={bx(PAD_X, RAIL_W)} y={y0} w={RAIL_W} h={L.bandH[b]} />
            <text
              x={railCx}
              y={railCy + RAIL_FS * 0.35}
              transform={`rotate(-90 ${railCx} ${railCy})`}
              textAnchor="middle"
              fontSize={RAIL_FS}
              letterSpacing={RAIL_LS}
              fill="var(--color-fg-body)"
            
              style={TEXT_BIDI}
            >
              {band.label}
            </text>

            {MATRIX[b].map((spec, i) => {
              const label = band.plates[i] ?? "";
              const s = span(spec.a, spec.b);
              const y = rowY[spec.row - 1];
              const lines = wrapMono(label, s.w);
              const h = plateHeight(lines.length);
              const chipsW = spec.chips * CHIP_W + (spec.chips - 1) * CHIP_GAP;
              const chipsX = s.x + s.w - PLATE_PAD_X - chipsW;
              const metaBaseline = y + PLATE_PAD_TOP + META_H * 0.5 + MARKER_FS * 0.35;
              const textTop = y + PLATE_PAD_TOP + META_H + PLATE_INNER_GAP;

              return (
                <g key={label}>
                  {plate(
                    s.x,
                    y,
                    s.w,
                    h,
                    "var(--color-surface-raised)",
                    spec.accent ? "var(--color-accent)" : undefined,
                  )}
                  <Marks x={bx(s.x, s.w)} y={y} w={s.w} h={h} />

                  <text
                    x={px(s.x + PLATE_PAD_X)}
                    y={metaBaseline}
                    textAnchor={anchor("start")}
                    fontSize={MARKER_FS}
                    letterSpacing={MARKER_LS}
                    fill="var(--color-fg-dim)"
                  
              style={TEXT_BIDI}
            >
                    {taskMarker}
                  </text>

                  {/* The reference's skewed chips. Its four signal hues become
                      the four-step text ramp; its 0.35-alpha trailing chip
                      becomes a hairline outline, so nothing depends on alpha. */}
                  <g aria-hidden="true">
                    {Array.from({ length: spec.chips }, (_, c) => {
                      const cx = bx(chipsX + c * (CHIP_W + CHIP_GAP), CHIP_W);
                      const top = y + PLATE_PAD_TOP + (META_H - CHIP_H) / 2;
                      const skew = rtl ? -CHIP_SKEW : CHIP_SKEW;
                      const d = `M${cx} ${top}h${CHIP_W}l${-skew} ${CHIP_H}h${-CHIP_W}Z`;
                      const filled = c < spec.filled;
                      return (
                        <path
                          key={c}
                          d={d}
                          fill={filled ? RAMP[spec.ramp] : "none"}
                          stroke={RAMP[spec.ramp]}
                          strokeWidth={1}
                        />
                      );
                    })}
                  </g>

                  {lines.map((line, li) => (
                    <text
                      key={line}
                      x={px(s.x + PLATE_PAD_X)}
                      y={textTop + PLATE_FS + li * PLATE_LINE_H}
                      textAnchor={anchor("start")}
                      fontSize={PLATE_FS}
                      letterSpacing={PLATE_LS}
                      fill="var(--color-fg)"
                    
              style={TEXT_BIDI}
            >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* the two bands are peers, separated by a hairline, not a fill */}
      <path
        aria-hidden="true"
        d={`M${PAD_X} ${L.dividerY}H${RIGHT_EDGE}`}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
      />
    </svg>
  );
}
