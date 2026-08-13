/**
 * The three theme icons — Auto, Light, Dark.
 *
 * ── PROVENANCE ──────────────────────────────────────────────────────────────
 *
 * Artwork from **Iconsax** (Linear variant), taken from the MIT-licensed
 * `iconsax-react` package: `Autobrightness`, `Sun`, `Moon`. The paths are
 * inlined rather than installed. Three icons do not earn a dependency, and a
 * package would also hand us a component whose colour is a `color` prop —
 * exactly the thing that cannot follow our theme.
 *
 * `Autobrightness` is the Auto state on its own merits: it is a badge with a
 * literal "A" inside it, so the icon says what the state is rather than
 * needing to be learned.
 *
 * ── COLOUR ──────────────────────────────────────────────────────────────────
 *
 * Every stroke is `currentColor`. Not one hex literal, and no `--color-*`
 * needed here — the button supplies the colour through the text ramp, so the
 * icon inherits the same active/inactive/hover treatment the labels had, and
 * follows the theme with it. Same discipline as the Egypt cover.
 *
 * Fill is `none` throughout: these are the Linear variant, drawn in stroke.
 *
 * ── SIZE ────────────────────────────────────────────────────────────────────
 *
 * A 24-unit viewBox scaled by the caller. `strokeWidth` stays in user units so
 * the weight scales with the glyph rather than thinning as it shrinks.
 *
 * Each icon is `aria-hidden`: the accessible name lives on the button, from
 * `ui_strings`. Losing the visible label must not lose the name.
 */

type IconProps = { className?: string };

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Auto — follows the OS. Iconsax `Autobrightness`, Linear. */
export function AutoThemeIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M10.75 2.45c.7-.59 1.83-.59 2.51 0l1.58 1.35c.3.25.87.46 1.27.46h1.7c1.06 0 1.93.87 1.93 1.93v1.7c0 .4.21.96.46 1.26l1.35 1.58c.59.7.59 1.83 0 2.51l-1.35 1.58c-.25.3-.46.86-.46 1.26v1.7c0 1.06-.87 1.93-1.93 1.93h-1.7c-.4 0-.96.21-1.26.46l-1.58 1.35c-.7.59-1.83.59-2.51 0l-1.58-1.35c-.3-.25-.87-.46-1.26-.46H6.17c-1.06 0-1.93-.87-1.93-1.93v-1.71c0-.39-.2-.96-.45-1.25l-1.35-1.59c-.58-.69-.58-1.81 0-2.5l1.35-1.59c.25-.3.45-.86.45-1.25V6.2c0-1.06.87-1.93 1.93-1.93H7.9c.4 0 .96-.21 1.26-.46l1.59-1.36Z" />
      {/* The "A". Bevel join is the reference's own — it keeps the apex sharp. */}
      <path d="M8.5 15.94 12 8.06l3.5 7.88" strokeLinejoin="bevel" />
      <path d="M13.75 13.31h-3.5" />
    </svg>
  );
}

/**
 * Light. Iconsax `Sun1`, Linear — a disc with eight round-capped ray dots.
 *
 * NOT Iconsax `Sun`, which was tried first and rejected on looking at it: its
 * twelve long rays sit close to a small centre disc, and at 20px they collapse
 * into a dense cluster that reads as a **snowflake**. On a theme control that
 * is not merely unclear, it is the wrong meaning — frost, not daylight. `Sun1`
 * has a larger disc and detached dots, so it survives the size.
 *
 * The ray dots are zero-length segments drawn at `strokeWidth: 2` with round
 * caps, which is how the reference draws them. That is deliberate, not a
 * degenerate path — a zero-length round-capped stroke paints a filled circle.
 */
export function LightThemeIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" />
      <path
        strokeWidth={2}
        d="m19.14 19.14-.13-.13m0-14.02.13-.13-.13.13ZM4.86 19.14l.13-.13-.13.13ZM12 2.08V2v.08ZM12 22v-.08.08ZM2.08 12H2h.08ZM22 12h-.08.08ZM4.99 4.99l-.13-.13.13.13Z"
      />
    </svg>
  );
}

/** Dark. Iconsax `Moon`, Linear. */
export function DarkThemeIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M2.03 12.42c.36 5.15 4.73 9.34 9.96 9.57 3.69.16 6.99-1.56 8.97-4.27.82-1.11.38-1.85-.99-1.6-.67.12-1.36.17-2.08.14C13 16.06 9 11.97 8.98 7.14c-.01-1.3.26-2.53.75-3.65.54-1.24-.11-1.83-1.36-1.3C4.41 3.86 1.7 7.85 2.03 12.42Z" />
    </svg>
  );
}
