/**
 * The burger and close icons — Iconsax `HambergerMenu` and `CloseSquare`'s
 * cross, Linear variant.
 *
 * ── PROVENANCE ──────────────────────────────────────────────────────────────
 *
 * Same source and same terms as `ThemeIcons.tsx` and `LinkIcon.tsx`: artwork
 * from **Iconsax** (Linear), taken from the MIT-licensed `iconsax-react`
 * package, paths inlined rather than installed. Two icons do not earn a
 * dependency, and the package's components colour themselves through a `color`
 * prop, which cannot follow this site's theme.
 *
 * ── COLOUR AND SIZE ─────────────────────────────────────────────────────────
 *
 * `currentColor` throughout, no hex literal — the button supplies the colour
 * through the text ramp, so both icons inherit the same treatment and follow
 * the theme with it.
 *
 * A 24-unit viewBox scaled by the caller. `strokeWidth` stays in user units so
 * the weight scales with the glyph rather than thinning as it shrinks.
 *
 * Both are `aria-hidden`: the accessible name lives on the button, from
 * `ui_strings` (migration 0052), and it CHANGES with the open state. Losing the
 * visible label must not lose the name.
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

/**
 * Burger. Iconsax `HambergerMenu`, Linear — three rules.
 *
 * The reference draws the middle rule shorter than the outer two. That is kept:
 * it is what distinguishes the mark from a generic three-line glyph, and at
 * 20px the asymmetry is still legible.
 */
export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3 7h18" />
      <path d="M3 12h13" />
      <path d="M3 17h18" />
    </svg>
  );
}

/** Close. A plain cross, drawn on the same grid and weight as the burger. */
export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}
