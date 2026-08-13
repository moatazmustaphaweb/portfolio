/**
 * Case File Cover — UAE Acquisition.
 *
 * Built from Moataz's written brief (2026-08-14) — the first cover specified
 * as a text spec rather than a .dc.html file. Subject: a biometric identity
 * portrait — a frontal human head rendered as a point cloud, framed by the
 * corner brackets of a capture viewfinder, tagged EFR. Emirates Face
 * Recognition is a real biometric check in the UAE onboarding journey,
 * confirmed by Moataz; the subject is settled and not re-opened here.
 *
 * It is the art practice made structural: identity reduced to captured data
 * points. One frame, static, per decision 023.
 *
 * NDA (decision 050): UAE carries nda = true, and this artwork has no NDA
 * surface to leak — no screen geometry, no field layouts, no interface
 * fragments. An abstract point cloud drawn from tokens reproduces nothing.
 *
 * ── RENDERING COST ──────────────────────────────────────────────────────────
 *
 * perf-budget's rule is that a field of points is never one DOM node per
 * point. This cloud is static — paint-once, no per-frame work — but the rule's
 * spirit still applies, so the points are BATCHED: a zero-length round-capped
 * stroke segment (`M x y h.01`) paints a filled circle, the same trick the
 * Sun1 icon's ray dots use, and every point in a bucket joins one `d` string.
 * ~400 points become SIX <path> elements — the whole artwork is ~18 DOM nodes.
 * Individual <circle> elements would have cost ~400 nodes in the DOM and
 * again in the RSC flight payload.
 *
 * ── DETERMINISM ─────────────────────────────────────────────────────────────
 *
 * The cloud is generated once at module scope from a SEEDED PRNG. Math.random
 * would emit a different SVG on every render — different bytes per request,
 * per build, and between the HTML and flight payload. Same seed, same cloud,
 * forever; regenerating the composition is a deliberate seed change.
 *
 * ── PALETTE ─────────────────────────────────────────────────────────────────
 *
 * Ground --color-bg. Depth comes from the four-step text ramp plus per-bucket
 * opacity — no glow, no blur, no gradient, exactly as everywhere else on this
 * site. The accent appears ONCE: the capture-lock ring at the fixation point
 * (see its comment). Zero hex literals.
 *
 * ── DIRECTION ───────────────────────────────────────────────────────────────
 *
 * A frontal symmetric face is reflection-safe by construction; features are
 * generated per side from one table. The artwork sets its own direction and
 * isolates its one text run, per the bidi lesson from the Egypt cover.
 */

export type UaeAcquisitionCoverProps = {
  /** The capture tag — "EFR". A prop, not a literal in the artwork (rule 1). */
  tag: string;
  /** Accessible name — what a screen reader announces. */
  alt: string;
  /** Read after the name. What the portrait is. */
  description: string;
  uid?: string;
  className?: string;
};

const W = 1600;
const H = 900;
const CX = 800;

/* ─── deterministic PRNG (mulberry32) ────────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── the buckets — ramp step × dot size × opacity ───────────────────────────
 *
 * Depth is the opacity ramp, not an effect: bright dense dots read as near
 * surface, dim sparse dots as falloff. Painted dim-first so features sit on
 * top. Dot diameter = strokeWidth; the smallest is 6 user units, which is
 * ~1.05px at a 280px render — at the floor, never sub-pixel.
 */
type BucketKey = "muted6" | "dim6" | "dim7" | "muted8" | "body9" | "fg10";

const BUCKETS: Record<BucketKey, { color: string; w: number; o: number }> = {
  muted6: { color: "var(--color-fg-muted)", w: 6, o: 0.45 },
  dim6: { color: "var(--color-fg-dim)", w: 6, o: 0.6 },
  dim7: { color: "var(--color-fg-dim)", w: 7, o: 0.85 },
  muted8: { color: "var(--color-fg-muted)", w: 8, o: 0.9 },
  body9: { color: "var(--color-fg-body)", w: 9, o: 0.95 },
  fg10: { color: "var(--color-fg)", w: 10, o: 1 },
};

const BUCKET_ORDER: readonly BucketKey[] = [
  "muted6",
  "dim6",
  "dim7",
  "muted8",
  "body9",
  "fg10",
];

/* ─── the cloud, generated once ──────────────────────────────────────────── */

const CLOUD = (() => {
  const rnd = mulberry32(424242);
  const jit = (amp: number) => (rnd() * 2 - 1) * amp;

  const d: Record<BucketKey, string[]> = {
    muted6: [],
    dim6: [],
    dim7: [],
    muted8: [],
    body9: [],
    fg10: [],
  };
  let count = 0;
  const dot = (k: BucketKey, x: number, y: number) => {
    d[k].push(`M${x.toFixed(1)} ${y.toFixed(1)}h.01`);
    count++;
  };

  /*
   * Right-half profile of the head, crown to chin, as [dx from centre, y].
   * Mirrored for the left side; also the half-width table the surface fill
   * tests against, so fill and outline cannot disagree about where the face
   * ends.
   */
  const PROFILE: readonly (readonly [number, number])[] = [
    [0, 180],
    [90, 190],
    [160, 240],
    [200, 320],
    [210, 400],
    [200, 470],
    [175, 545],
    [130, 620],
    [70, 690],
    [0, 725],
  ];

  const halfWidth = (y: number): number => {
    for (let i = 0; i < PROFILE.length - 1; i++) {
      const [x1, y1] = PROFILE[i];
      const [x2, y2] = PROFILE[i + 1];
      if (y >= y1 && y <= y2) return x1 + ((x2 - x1) * (y - y1)) / (y2 - y1);
    }
    return 0;
  };

  const polyline = (
    pts: readonly (readonly [number, number])[],
    step: number,
    j: number,
    k: BucketKey,
  ) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let s = 0; s < n; s++) {
        const t = s / n;
        dot(k, x1 + (x2 - x1) * t + jit(j), y1 + (y2 - y1) * t + jit(j));
      }
    }
    const [lx, ly] = pts[pts.length - 1];
    dot(k, lx + jit(j), ly + jit(j));
  };

  const ellipse = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    n: number,
    j: number,
    k: BucketKey,
  ) => {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      dot(k, cx + Math.cos(t) * rx + jit(j), cy + Math.sin(t) * ry + jit(j));
    }
  };

  /* head outline, both sides */
  for (const s of [1, -1]) {
    polyline(
      PROFILE.map(([dx, y]) => [CX + s * dx, y] as const),
      16,
      3,
      "muted8",
    );
  }

  /* eyes, irises, brows — generated per side from one table, so the face is
   * symmetric by construction rather than by care */
  for (const s of [1, -1]) {
    const ex = CX + s * 90;
    ellipse(ex, 432, 42, 17, 16, 1.5, "body9");
    ellipse(ex, 432, 11, 11, 8, 1, "fg10");
    dot("fg10", ex, 432);
    polyline(
      [
        [ex - s * 55, 384],
        [ex - s * 18, 369],
        [ex + s * 26, 372],
        [ex + s * 52, 386],
      ] as const,
      12,
      2,
      "body9",
    );
  }

  /* nose — bridge down the axis, base arc, nostrils */
  polyline(
    [
      [CX, 452],
      [CX, 505],
      [CX, 540],
    ] as const,
    13,
    2.5,
    "dim7",
  );
  polyline(
    [
      [CX - 32, 560],
      [CX - 14, 570],
      [CX, 573],
      [CX + 14, 570],
      [CX + 32, 560],
    ] as const,
    10,
    1.5,
    "body9",
  );
  dot("body9", CX - 34, 552);
  dot("body9", CX + 34, 552);

  /* lips — upper bow, lower arc */
  polyline(
    [
      [CX - 64, 612],
      [CX - 28, 601],
      [CX, 606],
      [CX + 28, 601],
      [CX + 64, 612],
    ] as const,
    10,
    1.5,
    "body9",
  );
  polyline(
    [
      [CX - 55, 623],
      [CX, 636],
      [CX + 55, 623],
    ] as const,
    11,
    1.5,
    "body9",
  );

  /* ears — just proud of the outline, as ears are */
  for (const s of [1, -1]) {
    polyline(
      [
        [CX + s * 206, 436],
        [CX + s * 216, 462],
        [CX + s * 208, 490],
      ] as const,
      12,
      2,
      "muted8",
    );
  }

  /*
   * Surface fill. A jittered lattice clipped to the profile, thinned toward
   * the edges of the form — denser where the features sit, sparser at the
   * rim, which is what gives the cloud a surface rather than a stencil.
   */
  for (let y = 205; y <= 705; y += 24) {
    const w = halfWidth(y) - 16;
    if (w < 24) continue;
    for (let x = -w; x <= w; x += 24) {
      const edge = Math.max(Math.abs(x) / w, Math.abs(y - 455) / 280);
      if (rnd() < 0.18 + 0.5 * edge * edge) continue;
      const r = rnd();
      dot(r < 0.5 ? "dim6" : r < 0.8 ? "muted6" : "dim7", CX + x + jit(10), y + jit(10));
    }
  }

  return {
    paths: BUCKET_ORDER.map((k) => ({ k, d: d[k].join("") })),
    count,
  };
})();

/** Exact point count — reported, not estimated. */
export const UAE_COVER_POINT_COUNT = CLOUD.count;

/* ─── fixed geometry ─────────────────────────────────────────────────────────
 *
 * Construction lines: centre axis, eye line with measurement ticks, nose-base
 * line, jaw guide. They read as measurement because they are drawn like it —
 * hairline, faint, ruled.
 */
const CONSTRUCTION =
  "M800 130V800M560 430H1040M700 560H900M640 690Q800 785 960 690";
const TICKS = "M590 422V438M650 422V438M710 422V438M890 422V438M950 422V438M1010 422V438";

/* Four corner brackets, never a rectangle. Rounded caps, fixed radius. */
const BRACKETS =
  "M480 180V138Q480 110 508 110H550" +
  "M1050 110H1092Q1120 110 1120 138V180" +
  "M480 720V762Q480 790 508 790H550" +
  "M1050 790H1092Q1120 790 1120 762V720";

export function UaeAcquisitionCover({
  tag,
  alt,
  description,
  uid = "uae-acquisition-cover",
  className,
}: UaeAcquisitionCoverProps) {
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      xmlns="http://www.w3.org/2000/svg"
      fontFamily="var(--font-mono)"
      /* The artwork sets its own direction — the bidi lesson from the Egypt
       * cover, kept. */
      style={{ direction: "ltr" }}
    >
      <title id={titleId}>{alt}</title>
      <desc id={descId}>{description}</desc>

      {/* ground + construction — measurement, not decoration */}
      <g aria-hidden="true">
        <rect width={W} height={H} fill="var(--color-bg)" />
        <path
          d={CONSTRUCTION}
          fill="none"
          stroke="var(--color-fg-dim)"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path
          d={TICKS}
          fill="none"
          stroke="var(--color-fg-dim)"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.3}
        />
      </g>

      {/* recognition frame — four corner brackets */}
      <g aria-hidden="true">
        <path
          d={BRACKETS}
          fill="none"
          stroke="var(--color-fg)"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>

      {/* the head — ~400 points in six paths */}
      <g fill="none" strokeLinecap="round">
        {CLOUD.paths.map(({ k, d }) => (
          <path
            key={k}
            d={d}
            stroke={BUCKETS[k].color}
            strokeWidth={BUCKETS[k].w}
            opacity={BUCKETS[k].o}
          />
        ))}
      </g>

      {/*
        THE ACCENT, used once: the capture-lock ring at the fixation point,
        where the centre axis crosses the eye line at the bridge of the nose.
        Everything else in the piece is either the person (the cloud, in the
        text ramp) or the instrument (lines and brackets, in fg). The ring is
        the one place instrument meets person — the point the system fixes on,
        the identity reduced to a single captured coordinate. It is never
        colour alone: the crosshair it sits on marks the same point.
      */}
      <circle
        aria-hidden="true"
        cx={CX}
        cy={430}
        r={22}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={4.5}
      />

      {/*
        The capture tag — the only text in the artwork. A Latin technical
        acronym (the KYC/OTP/NDA category per ui-strings-review.md): no
        translation, no flip with locale. Set in the top-start bracket's nook,
        where a viewfinder writes its tags.
      */}
      <text
        x={514}
        y={174}
        fontSize={26}
        letterSpacing={5}
        fill="var(--color-fg-dim)"
        style={{ unicodeBidi: "isolate" }}
      >
        {tag}
      </text>
    </svg>
  );
}
