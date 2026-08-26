# -*- coding: utf-8 -*-
"""Generate components/brand/HeroMark.tsx from designs/Logo-001858 1.svg.

The path data is 16KB and is COPIED, never retyped: a hand-transcribed bezier
is a silent corruption, and there is no test that would catch it.

Two transformations, and only two:

  1. `fill="white"` on a <path> becomes `fill="currentColor"`, so the mark takes
     its colour from CSS and follows the theme.

  2. `fill="white"` on a <mask> is LEFT ALONE. There it is the mask channel —
     white means "include this pixel" — not a colour. Changing it would empty
     the mask and delete two of the three shapes.

The ids are namespaced on the way through: Figma emits `path-1-inside-1_81_15`,
and two copies of this mark on one page would collide.
"""
import re

SRC = "/Users/moatazmustapha/Desktop/Moataz_Next/designs/Logo-001858 1.svg"
OUT = (
    "/Users/moatazmustapha/Desktop/Moataz_Next/.claude/worktrees/"
    "status-001220826/components/brand/HeroMark.tsx"
)

svg = open(SRC, encoding="utf-8").read()

# Everything between the <svg ...> and </svg>.
inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1).strip()

# 1. Visible paths take their colour from CSS. The mask tag keeps its white.
before = inner.count('fill="white"')
inner = re.sub(r'(<path\b[^>]*?)fill="white"', r'\1fill="currentColor"', inner)
mask_whites = len(re.findall(r'<mask\b[^>]*fill="white"', inner))
print(f"fill=white before: {before}  -> paths recoloured: {before - mask_whites}, masks kept: {mask_whites}")
assert mask_whites == 2, mask_whites
assert 'fill="currentColor"' in inner

# 2. Namespace the ids.
for old in re.findall(r'<mask id="([^"]+)"', inner):
    new = "hero-mark-" + old.split("-inside-")[1].split("_")[0]
    inner = inner.replace(f'id="{old}"', f'id="{new}"').replace(
        f'url(#{old})', f'url(#{new})'
    )

# Indent the body for readability inside JSX.
body = "\n".join("      " + line for line in inner.splitlines())

component = '''/**
 * The brand mark, sitting behind the landing hero.
 *
 * Traced from `designs/Logo-001858 1.svg` — and GENERATED from it rather than
 * copied by hand. The path data is 16KB of bezier curves; a transcription slip
 * would be silent, and no test on this project would catch a mark that is
 * subtly the wrong shape.
 *
 * ── TWO CHANGES FROM THE DESIGN FILE, AND ONLY TWO ──────────────────────────
 *
 * 1. `fill="white"` on each visible `<path>` became `currentColor`, so the mark
 *    takes its colour from CSS and follows the theme with no `dark:` variant —
 *    the same way the device frames do.
 *
 * 2. ⚠️ `fill="white"` on the two `<mask>` elements was LEFT ALONE. There,
 *    white is the mask channel — it means "include this pixel" — not a colour.
 *    Recolouring it would empty the mask and delete two of the three shapes.
 *    This is the one place in the file where white is not a colour.
 *
 * The Figma ids (`path-1-inside-1_81_15`) are namespaced on the way through:
 * ids are document-global, so two marks on one page would collide and the
 * second would silently borrow the first one's mask.
 *
 * ── IT IS DECORATION, NOT CONTENT ───────────────────────────────────────────
 *
 * `aria-hidden` and no title. The mark carries no information a reader needs —
 * the name is the `<h1>` two elements away — so announcing it would add noise
 * to a screen reader for nothing. Rule 1 is not engaged either: there is no
 * human-readable string here to come from the database.
 */
export function HeroMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 282 278"
      /*
       * No width or height, so the viewBox governs and CSS sets the box.
       * `h-auto w-full` inside whatever the caller sizes.
       */
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
%s
    </svg>
  );
}
''' % body

open(OUT, "w", encoding="utf-8").write(component)
print(f"wrote {OUT} ({len(component)} bytes)")
