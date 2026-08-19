/**
 * Case File Cover — UAE Acquisition, v2.
 *
 * Rebuilt from Moataz's second brief (2026-08-14): a holographic digital
 * profile — a left-facing head constructed from dots, a low-poly mesh and
 * network nodes, one glowing eye as the focal point, a PCB circuit network
 * dissolving out of the back of the head, floating padlocks, and a particle
 * field. Supersedes the frontal capture-viewfinder portrait from earlier the
 * same day.
 *
 * ── PALETTE: THE BRIEF'S HEXES DO NOT ENTER THE REPO ────────────────────────
 *
 * The brief names #68D5FF / #4DA7FF / #A86DFF / #FFFFFF. Those are three new
 * hues against a one-accent system, and hardcoded colour is exactly what
 * decision 049 exists to prevent — token binding is what makes a component
 * cover follow the theme at all, and cyan-on-white dies in light mode. So the
 * treatment is the same one the Egypt cover's four signal hues got: the STYLE
 * is recreated — depth, glow, a single luminous focal point — in the
 * four-step text ramp, with --color-accent used once, on the eye the brief
 * itself makes the focal point. Zero hex literals below.
 *
 * The one gradient the brief asks for is honoured: a radialGradient on the
 * eye's halo, with token stops fading to transparent. Glow everywhere else is
 * the opacity ramp — a wide faint dot under a small bright one — no filters.
 *
 * ── COST ────────────────────────────────────────────────────────────────────
 *
 * "Thousands of tiny dots" pulls against "lightweight enough for a hero".
 * Every dot is ~15 bytes twice (HTML + RSC flight), so thousands is real
 * kilobytes. The cloud lands around ~1,400 points — dense enough to read as a
 * surface, cheap enough to ship — batched with the `M x y h.01` round-cap
 * trick into ~14 paths, exactly as the previous cover. Exact count exported.
 *
 * Deterministic (seeded PRNG, module scope): byte-identical across renders,
 * builds, and the HTML/flight pair.
 *
 * ── DIRECTION ───────────────────────────────────────────────────────────────
 *
 * A profile facing its own circuit network is a self-contained picture, not a
 * reading order — same footing as the Egypt matrix: the artwork holds one
 * fixed composition in both locales and does not mirror.
 */

export type UaeAcquisitionCoverProps = {
  /** Accessible name — what a screen reader announces. */
  alt: string;
  /** Read after the name. What the portrait is. */
  description: string;
  uid?: string;
  className?: string;
};

const W = 900;
const H = 1200;

/* ─── deterministic PRNG ─────────────────────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── dot buckets — ramp step × size × opacity, dim first ────────────────── */

type DotKey =
  | "pFaint"
  | "pDim"
  | "pBright"
  | "faint"
  | "dim"
  | "muted"
  | "body"
  | "bright"
  | "glowHalo"
  | "glowCore";

const DOTS: Record<DotKey, { color: string; w: number; o: number }> = {
  pFaint: { color: "var(--color-fg-dim)", w: 3.5, o: 0.22 },
  pDim: { color: "var(--color-fg-muted)", w: 3, o: 0.38 },
  pBright: { color: "var(--color-fg-body)", w: 4, o: 0.55 },
  faint: { color: "var(--color-fg-dim)", w: 4, o: 0.3 },
  dim: { color: "var(--color-fg-dim)", w: 4.5, o: 0.55 },
  muted: { color: "var(--color-fg-muted)", w: 5, o: 0.7 },
  body: { color: "var(--color-fg-body)", w: 5.5, o: 0.85 },
  bright: { color: "var(--color-fg)", w: 6, o: 1 },
  /* glow without filters: a wide faint dot under a small bright one */
  glowHalo: { color: "var(--color-fg)", w: 16, o: 0.12 },
  glowCore: { color: "var(--color-fg)", w: 5, o: 0.95 },
};

const DOT_ORDER: readonly DotKey[] = [
  "pFaint",
  "pDim",
  "pBright",
  "faint",
  "dim",
  "muted",
  "body",
  "bright",
  "glowHalo",
  "glowCore",
];

/* ─── the artwork, generated once ────────────────────────────────────────── */

const GEN = (() => {
  const rnd = mulberry32(20260814);
  const jit = (amp: number) => (rnd() * 2 - 1) * amp;

  const dots: Record<DotKey, string[]> = {
    pFaint: [],
    pDim: [],
    pBright: [],
    faint: [],
    dim: [],
    muted: [],
    body: [],
    bright: [],
    glowHalo: [],
    glowCore: [],
  };
  let count = 0;
  const dot = (k: DotKey, x: number, y: number) => {
    dots[k].push(`M${x.toFixed(1)} ${y.toFixed(1)}h.01`);
    count++;
  };

  /* Left-facing profile: the face line runs down the LEFT of the head, crown
   * to chin to neck; the back of the skull closes the polygon on the right.
   * Y is monotonic down the face line, which is what frontX() interpolates. */
  const FACE: readonly (readonly [number, number])[] = [
    [430, 140], [340, 168], [290, 215], [262, 268], [248, 320], [244, 352],
    [252, 368], [243, 402], [222, 438], [205, 468], [212, 486], [232, 494],
    [228, 516], [244, 540], [232, 562], [238, 588], [252, 614], [268, 644],
    [300, 672], [345, 696], [400, 712], [448, 722], [452, 760], [446, 820],
  ];
  const BACK: readonly (readonly [number, number])[] = [
    [540, 824], [548, 760], [552, 700], [588, 660], [618, 610], [640, 548],
    [648, 470], [640, 388], [616, 308], [576, 236], [520, 180],
  ];
  const HEAD: readonly (readonly [number, number])[] = [...FACE, ...BACK];

  const inHead = (x: number, y: number): boolean => {
    let inside = false;
    for (let i = 0, j = HEAD.length - 1; i < HEAD.length; j = i++) {
      const [xi, yi] = HEAD[i];
      const [xj, yj] = HEAD[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  };

  const frontX = (y: number): number => {
    for (let i = 0; i < FACE.length - 1; i++) {
      const [x1, y1] = FACE[i];
      const [x2, y2] = FACE[i + 1];
      if (y >= y1 && y <= y2) return x1 + ((x2 - x1) * (y - y1)) / (y2 - y1);
    }
    return FACE[FACE.length - 1][0];
  };

  const EYE = { x: 330, y: 392 };

  /* ── network nodes: on the outline plus an interior lattice ── */
  const nodes: [number, number][] = [];
  for (let i = 0; i < HEAD.length; i++) {
    const [x1, y1] = HEAD[i];
    const [x2, y2] = HEAD[(i + 1) % HEAD.length];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(len / 44));
    for (let s = 0; s < n; s++) {
      const t = s / n;
      nodes.push([x1 + (x2 - x1) * t + jit(3), y1 + (y2 - y1) * t + jit(3)]);
    }
  }
  const outlineCount = nodes.length;
  for (let y = 180; y <= 800; y += 64) {
    for (let x = 210; x <= 650; x += 64) {
      const px = x + jit(22);
      const py = y + jit(22);
      if (!inHead(px, py)) continue;
      if (Math.hypot(px - EYE.x, py - EYE.y) < 72) continue;
      nodes.push([px, py]);
    }
  }

  /* mesh: each node to its two nearest neighbours, deduped, capped reach */
  const meshD: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    const near = nodes
      .map((p, j) => ({ j, d: Math.hypot(p[0] - nodes[i][0], p[1] - nodes[i][1]) }))
      .filter((e) => e.j !== i && e.d < 150)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      meshD.push(
        `M${nodes[i][0].toFixed(1)} ${nodes[i][1].toFixed(1)}L${nodes[j][0].toFixed(1)} ${nodes[j][1].toFixed(1)}`,
      );
    }
  }
  nodes.forEach(([x, y], i) => {
    if (i >= outlineCount && i % 9 === 0) {
      dot("glowHalo", x, y);
      dot("glowCore", x, y);
    } else {
      dot(i < outlineCount ? "muted" : rnd() < 0.25 ? "bright" : "body", x, y);
    }
  });

  /* neural overlay: brighter links across the face half, sparse by design */
  const neuralD: string[] = [];
  const faceNodes = nodes.filter(([x]) => x < 520);
  for (let k = 0; k < 14 && faceNodes.length > 2; k++) {
    const a = faceNodes[Math.floor(rnd() * faceNodes.length)];
    const b = faceNodes[Math.floor(rnd() * faceNodes.length)];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d < 40 || d > 210) continue;
    neuralD.push(`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
    dot("bright", a[0], a[1]);
    dot("bright", b[0], b[1]);
  }

  /* ── the dot surface of the face — brighter toward the profile edge ── */
  for (let y = 150; y <= 815; y += 12) {
    for (let x = 200; x <= 655; x += 12) {
      const px = x + jit(5);
      const py = y + jit(5);
      if (!inHead(px, py)) continue;
      if (Math.hypot(px - EYE.x, py - EYE.y) < 46) continue;
      if (rnd() < 0.28) continue;
      const depth = px - frontX(py); // distance behind the profile edge
      const r = rnd();
      const k: DotKey =
        depth < 90
          ? r < 0.4
            ? "body"
            : r < 0.8
              ? "muted"
              : "dim"
          : depth < 220
            ? r < 0.5
              ? "dim"
              : "faint"
            : r < 0.3
              ? "dim"
              : "faint";
      dot(k, px, py);
    }
  }
  /* the profile line itself, sampled dense and bright */
  for (let i = 0; i < FACE.length - 1; i++) {
    const [x1, y1] = FACE[i];
    const [x2, y2] = FACE[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 7));
    for (let s = 0; s < n; s++) {
      const t = s / n;
      dot(rnd() < 0.35 ? "bright" : "body", x1 + (x2 - x1) * t + jit(2.5), y1 + (y2 - y1) * t + jit(2.5));
    }
  }

  /* wireframe anatomy: brow, cheek, jaw, ear, neck — thin, faint, continuous */
  const CONTOURS: readonly (readonly (readonly [number, number])[])[] = [
    [[255, 350], [310, 340], [365, 350], [410, 368]],
    [[230, 500], [285, 520], [340, 560], [380, 610]],
    [[255, 625], [330, 670], [420, 700], [470, 710]],
    [[455, 430], [480, 445], [488, 480], [470, 515]],
    [[548, 640], [543, 790]],
  ];
  const contoursD = CONTOURS.map(
    (line) => `M${line.map(([x, y]) => `${x} ${y}`).join("L")}`,
  ).join("");

  /* ── the circuit network — PCB traces, 90° corners, fading rightward ── */
  const circuit: { d: string; endX: number }[] = [];
  const terminals: [number, number][] = [];
  const corners: [number, number][] = [];
  const trace = (x0: number, y0: number, startVertical: boolean) => {
    let x = x0;
    let y = y0;
    let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
    const segs = 3 + Math.floor(rnd() * 3);
    let vertical = startVertical;
    for (let s = 0; s < segs; s++) {
      if (vertical) {
        y = Math.min(1150, Math.max(130, y + (rnd() < 0.5 ? -1 : 1) * (24 + rnd() * 70)));
        d += `V${y.toFixed(0)}`;
      } else {
        x = Math.min(878, x + 36 + rnd() * 84);
        d += `H${x.toFixed(0)}`;
      }
      if (s < segs - 1) corners.push([x, y]);
      vertical = !vertical;
    }
    if (vertical) {
      // always end travelling right, into the dissolve
      x = Math.min(878, x + 30 + rnd() * 60);
      d += `H${x.toFixed(0)}`;
    }
    circuit.push({ d, endX: x });
    terminals.push([x, y]);
    return [x, y] as const;
  };
  for (let i = 0; i < 12; i++) {
    trace(614 + jit(14), 275 + i * 30 + jit(9), false);
  }
  for (let i = 0; i < 4; i++) {
    trace(560 + i * 22 + jit(8), 640 + i * 40 + jit(10), true);
  }
  /* short branches off a few corners */
  for (let i = 0; i < 5 && corners.length > 0; i++) {
    const [cx, cy] = corners[Math.floor(rnd() * corners.length)];
    trace(cx, cy, rnd() < 0.5);
  }
  corners.forEach(([x, y]) => dot("dim", x, y));

  const byFade = (lo: number, hi: number) =>
    circuit.filter((t) => t.endX >= lo && t.endX < hi).map((t) => t.d).join("");
  const circuitNear = byFade(0, 700);
  const circuitMid = byFade(700, 810);
  const circuitFar = byFade(810, 900);

  const terminalsD = terminals
    .map(([x, y]) => {
      const r = 4.5;
      return `M${(x + r).toFixed(0)} ${y.toFixed(0)}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0`;
    })
    .join("");

  /* ── particles — everywhere but the head, thinning naturally ── */
  for (let y = 60; y <= 1160; y += 46) {
    for (let x = 40; x <= 870; x += 46) {
      const px = x + jit(18);
      const py = y + jit(18);
      if (inHead(px, py)) continue;
      if (rnd() < 0.52) continue;
      const r = rnd();
      dot(r < 0.5 ? "pFaint" : r < 0.85 ? "pDim" : "pBright", px, py);
    }
  }

  /* ── four padlocks, outline only, generous spacing ── */
  const lock = (x: number, y: number) =>
    `M${x - 8} ${y - 2}v-7a8 8 0 0 1 16 0v7` +
    `M${x - 12} ${y - 2}h24q4 0 4 4v14q0 4-4 4h-24q-4 0-4-4v-14q0-4 4-4z` +
    `M${x} ${y + 6}v5`;
  const locksD = [lock(118, 176), lock(806, 138), lock(102, 936), lock(802, 1058)].join("");

  return {
    dots: DOT_ORDER.map((k) => ({ k, d: dots[k].join("") })),
    meshD: meshD.join(""),
    neuralD: neuralD.join(""),
    contoursD,
    circuitNear,
    circuitMid,
    circuitFar,
    terminalsD,
    locksD,
    count,
  };
})();

/** Exact point count — reported, not estimated. */
export const UAE_COVER_POINT_COUNT = GEN.count;

const EYE = { x: 330, y: 392 };

export function UaeAcquisitionCover({
  alt,
  description,
  uid = "uae-acquisition-cover",
  className,
}: UaeAcquisitionCoverProps) {
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const glowId = `${uid}-eye-glow`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <title id={titleId}>{alt}</title>
      <desc id={descId}>{description}</desc>

      <defs>
        {/*
          The one gradient, on the one accent element. Token stops fading to
          transparent — the "glow" is opacity, not a filter, and no second
          hue exists anywhere in the piece.
        */}
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
          <stop offset="55%" stopColor="var(--color-accent)" stopOpacity={0.14} />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* transparent ground — the artwork sits on the page's own surface */}

      <g id={`${uid}-particles`} aria-hidden="true" strokeLinecap="round">
        {GEN.dots
          .filter(({ k }) => k.startsWith("p"))
          .map(({ k, d }) =>
            d ? (
              <path key={k} d={d} stroke={DOTS[k].color} strokeWidth={DOTS[k].w} opacity={DOTS[k].o} />
            ) : null,
          )}
      </g>

      <g id={`${uid}-circuits`} aria-hidden="true">
        <path d={GEN.circuitNear} stroke="var(--color-fg-muted)" strokeWidth={2} opacity={0.55} />
        <path d={GEN.circuitMid} stroke="var(--color-fg-muted)" strokeWidth={2} opacity={0.36} />
        <path d={GEN.circuitFar} stroke="var(--color-fg-dim)" strokeWidth={2} opacity={0.22} />
        <path d={GEN.terminalsD} stroke="var(--color-fg-muted)" strokeWidth={2} opacity={0.5} />
      </g>

      <g id={`${uid}-mesh`} aria-hidden="true">
        <path d={GEN.meshD} stroke="var(--color-fg-dim)" strokeWidth={1} opacity={0.3} />
        <path d={GEN.contoursD} stroke="var(--color-fg-dim)" strokeWidth={1.2} opacity={0.35} />
        <path d={GEN.neuralD} stroke="var(--color-fg-body)" strokeWidth={1.2} opacity={0.45} />
      </g>

      <g id={`${uid}-face`} strokeLinecap="round">
        {GEN.dots
          .filter(({ k }) => !k.startsWith("p"))
          .map(({ k, d }) =>
            d ? (
              <path key={k} d={d} stroke={DOTS[k].color} strokeWidth={DOTS[k].w} opacity={DOTS[k].o} />
            ) : null,
          )}
      </g>

      <g id={`${uid}-locks`} aria-hidden="true">
        <path d={GEN.locksD} stroke="var(--color-fg-muted)" strokeWidth={2} opacity={0.7} strokeLinecap="round" />
      </g>

      {/*
        THE EYE — the focal point, and the accent's one appearance. Concentric
        rings over a token-stop gradient halo: luminosity from opacity, depth
        from the ramp, the same physics as everywhere else on this site.
      */}
      <g id={`${uid}-eye`}>
        <circle cx={EYE.x} cy={EYE.y} r={64} fill={`url(#${glowId})`} />
        <circle cx={EYE.x} cy={EYE.y} r={30} stroke="var(--color-accent)" strokeWidth={1.5} opacity={0.3} />
        <circle cx={EYE.x} cy={EYE.y} r={20} stroke="var(--color-accent)" strokeWidth={2} opacity={0.55} />
        <circle cx={EYE.x} cy={EYE.y} r={12} stroke="var(--color-accent)" strokeWidth={2.5} opacity={0.9} />
        <circle cx={EYE.x} cy={EYE.y} r={5} fill="var(--color-fg)" />
      </g>
    </svg>
  );
}
