# docs/design/tokens.md — Visual Language

> 🔴 **NOT YET DECIDED — THIS BLOCKS ALL PAGE BUILDING.**
> Will be filled in from the Claude Design file. Until then, Claude Code must not build pages or invent styling defaults. If styling is needed to proceed, stop and ask.

---

## WHAT THIS FILE MUST CONTAIN

### Colour
- [ ] Background scale (surface levels)
- [ ] Foreground scale (primary, secondary, muted text)
- [ ] Accent / brand colour
- [ ] Border and divider values
- [ ] Focus-state colour (must meet contrast requirements)
- [ ] **Redaction palette** — the masked/abstracted NDA treatment
- [ ] Dark mode: yes or no? (decision, not assumption)

### Typography
- [ ] Latin typeface + weights
- [ ] **Arabic typeface + weights** — must pair optically with the Latin face
- [ ] Type scale (sizes and line heights, both scripts)
- [ ] Long-form reading settings (measure, leading)
- [ ] Heading hierarchy

### Space & form
- [ ] Spacing scale
- [ ] Border radius scale
- [ ] Elevation / shadow (if any)
- [ ] Container widths and grid
- [ ] Breakpoints (mobile-first, from 320px)

### Motion
- [ ] Durations and easing
- [ ] What animates and what doesn't
- [ ] `prefers-reduced-motion` behaviour

---

## OUTPUT FORMAT

CSS custom properties in `app/globals.css`, consumed by Tailwind. Token names are semantic, never literal:

```css
:root {
  --color-bg;          --color-bg-subtle;
  --color-fg;          --color-fg-muted;
  --color-accent;      --color-border;
  --color-redacted;
  --font-latin;        --font-arabic;
  --space-1 … --space-12;
  --radius-sm/md/lg;
  --duration-fast/base/slow;
}
```

Use `--color-fg-muted`, not `--color-gray-600`. Semantic names survive a palette change; literal ones don't.

---

## CONSTRAINTS THAT ALREADY APPLY

1. **Logical properties only** — every token must work mirrored in RTL. No left/right-specific values.
2. **WCAG AA contrast minimum** on all text and interactive states.
3. **Arabic is not an afterthought** — the Arabic face carries equal weight in the pairing decision, and the type scale must be verified in both scripts.
4. **Restraint** — the audience includes banking hiring managers and cultural evaluators. Craft over decoration.
5. **The redaction treatment must look intentional**, never like a broken or censored image.
