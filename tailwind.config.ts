import type { Config } from "tailwindcss";

/**
 * Tailwind token map — see docs/design/tokens.md.
 *
 * Colour, spacing, radius, font-size, border-width and duration scales are
 * REPLACED rather than extended, so only on-system values are reachable. The
 * system has one stroke weight, three radii, a four-step text ramp and a single
 * accent; a full replace is what stops those from quietly growing.
 *
 * Every value is CSS-variable backed, so both themes work without a single
 * `dark:` variant anywhere in the components.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",

      bg: "var(--color-bg)",
      surface: {
        DEFAULT: "var(--color-surface)",
        raised: "var(--color-surface-raised)",
      },
      scrim: "var(--color-scrim)",

      // The four-step text ramp. There is no fifth step.
      fg: {
        DEFAULT: "var(--color-fg)",
        body: "var(--color-fg-body)",
        muted: "var(--color-fg-muted)",
        dim: "var(--color-fg-dim)",
      },

      border: {
        DEFAULT: "var(--color-border)",
        strong: "var(--color-border-strong)",
        subtle: "var(--color-border-subtle)",
      },

      // One accent. Never the sole indicator of a state — always paired with a
      // border, underline or label.
      accent: {
        DEFAULT: "var(--color-accent)",
        fg: "var(--color-accent-fg)",
      },

      nda: {
        DEFAULT: "var(--color-nda-fill)",
        stroke: "var(--color-nda-stroke)",
        badge: "var(--color-nda-badge)",
      },
    },

    // Each token carries size, line-height, weight and tracking together, so
    // `text-hero` sets all four and headings can't drift out of the scale.
    fontSize: {
      hero: [
        "var(--text-hero)",
        { lineHeight: "1.02", fontWeight: "600", letterSpacing: "-0.045em" },
      ],
      title: [
        "var(--text-title)",
        { lineHeight: "1.03", fontWeight: "600", letterSpacing: "-0.04em" },
      ],
      h2: [
        "var(--text-h2)",
        { lineHeight: "1.08", fontWeight: "600", letterSpacing: "-0.035em" },
      ],
      h3: [
        "var(--text-h3)",
        { lineHeight: "1.15", fontWeight: "600", letterSpacing: "-0.03em" },
      ],
      lead: [
        "var(--text-lead)",
        { lineHeight: "1.3", fontWeight: "400", letterSpacing: "-0.02em" },
      ],
      statement: [
        "var(--text-statement)",
        { lineHeight: "1.4", fontWeight: "500", letterSpacing: "-0.02em" },
      ],
      metric: [
        "var(--text-metric)",
        { lineHeight: "1", fontWeight: "600", letterSpacing: "-0.03em" },
      ],
      /*
       * The fixed sizes are tokens now, not literals. They were the only part
       * of the scale a stylesheet could not reach, and the Arabic faces need
       * the whole scale adjusted, not just the fluid display end (decision 045).
       */
      /*
       * A section heading above prose. No `letterSpacing`: the label sizes
       * carry 0.12em because 11px mono needs it to stay legible, and the same
       * tracking at 20px sets the words far too wide.
       */
      section: ["var(--text-section)", { lineHeight: "1.3", fontWeight: "500" }],
      body: ["var(--text-body)", { lineHeight: "1.7", fontWeight: "400" }],
      "body-sm": ["var(--text-body-sm)", { lineHeight: "1.6", fontWeight: "400" }],
      ui: ["var(--text-ui)", { lineHeight: "1.4", fontWeight: "500" }],
      meta: ["var(--text-meta)", { lineHeight: "1.5", fontWeight: "400" }],
      // Mono metadata. Pair with font-mono + uppercase.
      label: ["var(--text-label)", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.12em" }],
      micro: ["var(--text-micro)", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.1em" }],
    },

    fontFamily: {
      sans: ["var(--font-sans)"],
      mono: ["var(--font-mono)"],
      // Arabic is applied by :lang(ar) in globals.css, not by utility class —
      // the script decides the face, not the author of each component. These
      // exist for the rare deliberate override.
      "arabic-heading": ["var(--font-arabic-heading)"],
      "arabic-body": ["var(--font-arabic-body)"],
    },

    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },

    // 4px base, enumerated steps only. Off-scale utilities resolve to nothing —
    // snap to the scale rather than reaching for an arbitrary value.
    spacing: {
      "0": "0px",
      px: "1px",
      "1": "var(--space-1)",
      "2": "var(--space-2)",
      "3": "var(--space-3)",
      "4": "var(--space-4)",
      "5": "var(--space-5)",
      "6": "var(--space-6)",
      "8": "var(--space-8)",
      "10": "var(--space-10)",
      "14": "var(--space-14)",
      "18": "var(--space-18)",
      "22": "var(--space-22)",
      gutter: "var(--gutter)",
      "section-y": "var(--section-y)",
      "section-y-hero": "var(--section-y-hero)",
      "card-p": "var(--card-p)",
      "header-h": "var(--header-h)",
      "control-h": "var(--control-h)",
      "control-h-sm": "var(--control-h-sm)",
    },

    borderRadius: {
      none: "0",
      control: "var(--radius-control)",
      panel: "var(--radius-panel)",
      pill: "var(--radius-pill)",
    },

    // One stroke weight in the system. `0` exists only to remove a border.
    borderWidth: {
      "0": "0px",
      DEFAULT: "var(--border-width)",
    },

    /*
     * Declared explicitly rather than inherited from `colors`, which would
     * produce `border-border-strong`. The colour keys stay as they are because
     * the hairline is also used as a fill for 1px divider elements (`bg-border`).
     */
    borderColor: {
      DEFAULT: "var(--color-border)",
      strong: "var(--color-border-strong)",
      subtle: "var(--color-border-subtle)",
      accent: "var(--color-accent)",
      nda: "var(--color-nda-stroke)",
      fg: "var(--color-fg)",
      transparent: "transparent",
      current: "currentColor",
    },

    // No elevation scale — depth is a hairline plus a surface step.
    boxShadow: {
      none: "none",
    },

    transitionDuration: {
      DEFAULT: "var(--duration)",
    },

    transitionTimingFunction: {
      DEFAULT: "var(--ease)",
    },

    // Only colour and opacity transition. Never transform, size or shadow.
    transitionProperty: {
      none: "none",
      colors:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      opacity: "opacity",
    },

    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },

    extend: {
      maxWidth: {
        container: "var(--container-max)",
        prose: "var(--container-prose)",
        measure: "var(--measure-prose)",
        "measure-lead": "var(--measure-lead)",
      },
      backdropBlur: {
        header: "var(--blur-header)",
      },
      minWidth: {
        // For controls whose label changes on screen — see globals.css.
        control: "var(--control-min-w)",
        pill: "var(--pill-min-w)",
      },
      height: {
        "header-h": "var(--header-h)",
        "control-h": "var(--control-h)",
        "control-h-sm": "var(--control-h-sm)",
      },
    },
  },
  plugins: [],
};

export default config;
