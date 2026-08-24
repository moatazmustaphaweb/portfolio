/**
 * The link icon — Iconsax `Link2`, Linear variant.
 *
 * ── PROVENANCE ──────────────────────────────────────────────────────────────
 *
 * Same source and same terms as `ThemeIcons.tsx`: artwork from **Iconsax**
 * (Linear variant), taken from the MIT-licensed `iconsax-react` package, paths
 * inlined rather than installed. The reasoning there applies unchanged — a
 * handful of icons do not earn a dependency, and the package hands back a
 * component whose colour is a `color` prop, which is exactly the thing that
 * cannot follow our theme.
 *
 * Kept in its own file rather than added to `ThemeIcons.tsx`, which is named
 * for what it holds: the three theme states. A link is not a theme.
 *
 * ── COLOUR AND SIZE ─────────────────────────────────────────────────────────
 *
 * `currentColor` throughout, no hex literal — the button supplies the colour
 * through the text ramp, so the icon inherits the dimmed/hover treatment and
 * follows the theme with it.
 *
 * A 24-unit viewBox scaled by the caller to 16px (`h-4 w-4`), inside a 24px
 * box. `strokeWidth` stays in user units so the weight scales with the glyph
 * rather than thinning as it shrinks.
 *
 * `aria-hidden`: the accessible name lives on the button, from `ui_strings`.
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

export function LinkIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M9.17 14.83l5.66-5.66" />
      <path d="M10.11 6.11L11.29 4.93a5 5 0 017.78 7.78l-1.18 1.18" />
      <path d="M13.89 17.89l-1.18 1.18a5 5 0 01-7.78-7.78l1.18-1.18" />
    </svg>
  );
}
