/**
 * The "this card opens" affordance on an internal card link (tasks 007261026,
 * 008261026).
 *
 * One treatment for every whole-block card link on the site: the card is a
 * `group flex items-center gap-4` row, its content sits in a `min-w-0 flex-1`
 * column, and this span is the last child, so it lands on the inline-end side
 * and centres vertically. The row mirrors with `dir`; nothing here is physical.
 *
 * The glyph is passed in already resolved (`ui.t("arrow_forward")` or
 * `ui.t("arrow_back")`, EN → / AR ←). It is content (rtl-guard): never a
 * literal here, never flipped with CSS. Undefined while the key is missing,
 * and then nothing renders, never the key name.
 *
 * Body-sm size, the size of the cards' description line. Colour only on hover
 * and focus: decision 048 forbids transform on content-level components.
 */
export function CardArrow({ glyph }: { glyph?: string }) {
  if (!glyph) return null;

  return (
    <span
      aria-hidden="true"
      className="shrink-0 text-body-sm leading-none text-fg-dim transition-colors group-hover:text-fg group-focus-visible:text-fg"
    >
      {glyph}
    </span>
  );
}
