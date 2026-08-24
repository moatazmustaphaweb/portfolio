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
 * ── WHAT THE OLD COMPONENT'S OWN COMMENT ARGUED, AND WHY THIS STILL HOLDS ───
 *
 * The radiogroup existed because a cycling button can announce only where you
 * are GOING, not where you ARE — `aria-checked` on three radios said both.
 * That is not fixed by removing the radios; it is answered a different way:
 * `aria-label` is rebuilt on every render from `theme_toggle` + the CURRENT
 * choice's own label (e.g. "Toggle theme: System"), so a screen reader still
 * hears where you are, not just that a button was pressed. No new copy — both
 * strings already exist in `ui_strings`, composed rather than invented (rule
 * 7).
 *
 * Visually the icon carries the same information: it is always the CURRENT
 * state's icon, never the state you are about to move to.
 *
 * ── ORDER ─────────────────────────────────────────────────────────────────
 *
 * System → Light → Dark → System. Fixed and arbitrary — a 3-cycle has no
 * canonical direction — chosen to match the left-to-right order the old
 * radiogroup displayed, so nothing about the mental model changes, only the
 * control.
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
  // "system" is the correct resting icon/label for that gap: it is the
  // default, and the pre-paint script has already applied it if nothing was
  // explicitly chosen.
  const current = choice ?? "system";
  const currentLabel = labels[current];
  const Icon =
    current === "light" ? LightThemeIcon : current === "dark" ? DarkThemeIcon : AutoThemeIcon;

  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setThemeChoice(next)}
      aria-label={ariaLabel && currentLabel ? `${ariaLabel}: ${currentLabel}` : ariaLabel}
      className="tap-target-44 flex h-control-h-sm items-center justify-center rounded-control border border-DEFAULT px-3 text-fg-dim transition-colors hover:text-fg"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
