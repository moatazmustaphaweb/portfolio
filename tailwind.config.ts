import type { Config } from "tailwindcss";

/**
 * Neubrutalist Design System — Tailwind token map.
 *
 * Every value below is transcribed 1:1 from the design system's token files
 * (_ds/.../tokens/*.css). Default Tailwind scales for color, spacing, radius,
 * shadow, border-width and duration are REPLACED (not extended) so only
 * on-system values are reachable — the system forbids tints, alpha, blur
 * shadows and mixed border weights, and a full replace enforces that.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    // ---- Color — off-white page, white surface, true-black ink, one accent ----
    // Full replace: no gray scale exists in the system (hierarchy is size/weight,
    // never gray text), and the only permitted alpha is the disabled opacity.
    // Structural tokens are CSS-variable backed so the whole system inverts in
    // dark mode (see the light/dark blocks in globals.css) without per-component
    // `dark:` variants. `black`/`white` are kept as aliases of ink/ink-inverse so
    // existing `border-black`, `text-black`, `bg-black`, `text-white` utilities
    // flip automatically. Semantic signal colours are identical in both themes.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",

      page: "var(--page)", // page background
      bg: "var(--page)", // alias for existing bg-bg usages
      surface: "var(--surface)", // card / raised surface
      ink: "var(--ink)", // text, borders, hard shadows
      "ink-inverse": "var(--ink-inverse)", // text/marks sitting ON an ink fill
      black: "var(--ink)", // alias → ink (flips)
      white: "var(--ink-inverse)", // alias → ink-inverse (flips)

      accent: {
        DEFAULT: "var(--accent)", // accent fill (white text sits on it)
        text: "var(--accent-text)", // text on an accent fill
        ink: "var(--accent-ink)", // accent used AS text/links (brighter on dark)
      },

      // Semantic — same in both themes (saturated signal colours)
      success: "#00A651",
      warning: "#FFB000",
      error: "#E5233D",
    },

    // ---- Type scale — Space Grotesk; hierarchy from size + weight only ----
    // Each token carries its line-height AND weight, so `text-h1` sets all three.
    fontSize: {
      display: ["56px", { lineHeight: "1.05", fontWeight: "700" }],
      h1: ["36px", { lineHeight: "1.1", fontWeight: "700" }],
      h2: ["28px", { lineHeight: "1.1", fontWeight: "700" }],
      h3: ["20px", { lineHeight: "1.15", fontWeight: "600" }],
      body: ["15px", { lineHeight: "1.5", fontWeight: "400" }],
      caption: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      badge: ["11px", { lineHeight: "1", fontWeight: "700" }], // --type-badge-size
    },

    fontFamily: {
      // next/font injects --font-space-grotesk (see app/layout.tsx)
      sans: ["var(--font-space-grotesk)", "Helvetica Neue", "Arial", "sans-serif"],
    },

    fontWeight: {
      normal: "400", // body
      medium: "500", // caption
      semibold: "600", // h3
      bold: "700", // display/h1/h2, labels, badges — no thin/light weights exist
    },

    // ---- Space — 4px base; only the enumerated steps exist ----
    // Full replace of the spacing scale (feeds p/m/gap/space/inset/size utilities).
    spacing: {
      "0": "0px",
      px: "1px",
      "1": "4px", // --space-1
      "2": "8px", // --space-2
      "3": "12px", // --space-3
      "4": "16px", // --space-4
      "6": "24px", // --space-6  (also the layout gutter)
      "8": "32px", // --space-8
      "12": "48px", // --space-12
      "16": "64px", // --space-16
    },

    // ---- Layout container ----
    maxWidth: {
      none: "none",
      full: "100%",
      layout: "1200px", // --layout-max-width
    },

    // ---- Borders — one weight everywhere; focus is the only exception ----
    borderWidth: {
      DEFAULT: "2px", // --border-width
      "0": "0px",
      "2": "2px", // --border-width
      "3": "3px", // --border-width-focus (input focus only)
    },

    // ---- Radii — 0 dividers · 8 chips · 16 cards · 24 panels · 999 pills ----
    borderRadius: {
      none: "0px", // --radius-0  (dividers)
      sm: "8px", // --radius-sm  (chips, small controls)
      md: "16px", // --radius-md  (cards)
      lg: "24px", // --radius-lg  (large panels)
      pill: "999px", // --radius-pill
    },

    // ---- Elevation — hard offsets only, always down-right; NO blur ever ----
    // Hard offsets in the ink colour — off-white in dark mode, so the poster-like
    // shadow language survives the inversion.
    boxShadow: {
      none: "none",
      flat: "none", // --shadow-flat
      raised: "4px 4px 0 var(--ink)", // --shadow-raised
      pressed: "2px 2px 0 var(--ink)", // --shadow-pressed (hover)
      active: "0 0 0 var(--ink)", // --shadow-active (press)
    },

    // ---- Motion — capped at 100ms, transform/shadow only ----
    transitionDuration: {
      DEFAULT: "100ms", // --motion-fast
      fast: "100ms",
    },
    transitionTimingFunction: {
      DEFAULT: "ease-out", // --motion-fast
    },

    // Focus ring: 3px black outline, 2px offset, on every interactive element.
    outlineWidth: {
      "0": "0px",
      "3": "3px", // --focus-outline width
    },
    outlineOffset: {
      "2": "2px", // --focus-offset
    },

    extend: {},
  },
  plugins: [],
};

export default config;
