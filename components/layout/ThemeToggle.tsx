"use client";

import { useSyncExternalStore } from "react";

import {
  AutoThemeIcon,
  DarkThemeIcon,
  LightThemeIcon,
} from "@/components/layout/ThemeIcons";
import {
  getChoiceServerSnapshot,
  getChoiceSnapshot,
  setThemeChoice,
  subscribeTheme,
  type ThemeChoice,
} from "@/lib/theme/store";

/**
 * Theme control — one button, cycling System → Light → Dark → System.
 *
 * Replaced the three-button radiogroup 2026-08-24, task `028240826`, on
 * Moataz's explicit instruction after the first mobile visual pass: the
 * header wrapped to two lines, and the theme control's three 44px targets
 * were the largest single contributor.
 *
 * ── ICON AND LABEL SHOW THE DESTINATION, NOT THE CURRENT STATE ─────────────
 *
 * Changed 2026-08-24, task `030240826`, on Moataz's correction: he compared
 * it to `LocaleSwitch` right next to it, which shows "العربية" while on the
 * English page — the label there is what clicking DOES, not where you are.
 * This control now matches that: both `Icon` and `aria-label` are keyed off
 * `next`, never off `current`.
 *
 * This still answers the old three-radio component's own reason for
 * existing — a cycling button can say only where you're going, not where you
 * are — the same way `LocaleSwitch` answers it: the CURRENT state is legible
 * from the page itself (it visibly IS light or dark; the surrounding words
 * visibly ARE English), the same way a page's language is legible from its
 * own words. Nothing here needs to re-state what the page already shows.
 *
 * `aria-label` still composes from `ui_strings` that already exist —
 * `theme_toggle` + the DESTINATION choice's own label, e.g.
 * "Toggle theme: Dark" — so it agrees with the icon rather than contradicting
 * it, and nothing is invented (rule 7).
 *
 * ── ORDER, AND WHY IT DOES NOT BRANCH ON THE RESOLVED OS THEME ─────────────
 *
 * Fixed: System → Light → Dark → System. A 3-cycle has no canonical
 * direction, so this was chosen to match the left-to-right order the old
 * radiogroup displayed — nothing about the mental model changes, only the
 * control.
 *
 * Moataz's own framing ("if System has resolved to light, show dark") reads
 * naturally for a 2-state light/dark toggle, but this is a 3-state cycle:
 * from System, the fixed order's next stop is Light, not "whichever of
 * light/dark the OS isn't currently showing." Branching the next state on
 * the resolved OS theme would make the cycle length non-deterministic — two
 * clicks gets back to System for a visitor on a light OS, three for one on a
 * dark OS — which is a worse contract than a fixed, always-3-click cycle.
 * Kept fixed; flagged rather than guessed past.
 */
const ORDER: ThemeChoice[] = ["system", "light", "dark"];

export function ThemeToggle({
  labels,
  ariaLabel,
}: {
  labels: { system?: string; light?: string; dark?: string };
  ariaLabel?: string;
}) {
  const choice = useSyncExternalStore(
    subscribeTheme,
    getChoiceSnapshot,
    getChoiceServerSnapshot,
  );

  // `choice` is null until the browser answers (server cannot know it).
  // "system" is the correct resting state for that gap: it is the default,
  // and the pre-paint script has already applied it if nothing was
  // explicitly chosen.
  const current = choice ?? "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const nextLabel = labels[next];

  // The icon and label both key off `next` — what clicking DOES — not
  // `current`. See the component comment.
  const Icon = next === "light" ? LightThemeIcon : next === "dark" ? DarkThemeIcon : AutoThemeIcon;

  return (
    <button
      type="button"
      onClick={() => setThemeChoice(next)}
      aria-label={ariaLabel && nextLabel ? `${ariaLabel}: ${nextLabel}` : ariaLabel}
      className="tap-target-44 flex h-control-h-sm items-center justify-center rounded-control border border-DEFAULT px-3 text-fg-dim transition-colors hover:text-fg"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
