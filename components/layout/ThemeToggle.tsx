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
  getSystemPreferenceServerSnapshot,
  getSystemPreferenceSnapshot,
  setThemeChoice,
  type Theme,
  type ThemeChoice,
  subscribeTheme,
} from "@/lib/theme/store";

/**
 * Theme control — one button. Icon and label always show what clicking DOES,
 * never the current state (task `030240826`, following `LocaleSwitch`'s same
 * rule: the current state is legible from the page itself).
 *
 * ── THE CYCLE ORDER IS OS-DEPENDENT, CORRECTED 2026-08-24, TASK `031240826` ─
 *
 * `030240826` shipped a FIXED order — System → Light → Dark → System — and
 * its own comment argued against branching on the OS preference, calling it
 * non-deterministic. Moataz overruled that with a fully worked spec for both
 * directions, and it resolves the concern rather than ignoring it: the order
 * is OS-dependent, but internally consistent for a given OS preference, and
 * it is exactly what makes the toggle useful — from System, it offers the
 * visual experience you HAVEN'T seen first, not the one already painted.
 *
 * Let `os` be the raw OS preference (`getSystemPreferenceSnapshot`, NOT
 * `getThemeSnapshot` — that second one collapses to an explicit choice once
 * one is pinned, which is exactly the case this needs to see through) and
 * `other(t)` be its opposite colour:
 *
 *   current = system   → next = other(os)   — the colour you haven't seen
 *   current = other(os) → next = os          — pin the OS's own colour
 *   current = os        → next = system      — back to auto
 *
 * Worked example, OS = light: system → dark → light → system. A visitor on a
 * dark OS gets the mirror image: system → light → dark → system. Both are
 * exactly Moataz's two spelled-out sequences.
 *
 * `current`, `other(os)` and `os` partition `{system, light, dark}` exactly
 * once each, so the three branches above are exhaustive — no default case
 * needed, and none was added.
 *
 * `aria-label` composes from `ui_strings` that already exist — `theme_toggle`
 * + the DESTINATION choice's own label — same discipline as before, nothing
 * invented (rule 7).
 */
function otherOf(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}

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
  const osPref = useSyncExternalStore(
    subscribeTheme,
    getSystemPreferenceSnapshot,
    getSystemPreferenceServerSnapshot,
  );

  // Both null until the browser answers (server cannot know either). "system"
  // is the pre-paint script's own default when nothing was chosen; "dark" is
  // the codebase's stated default (decision 019) — a reasonable resting guess
  // for the brief pre-hydration window, corrected immediately after.
  const current: ThemeChoice = choice ?? "system";
  const os: Theme = osPref ?? "dark";

  const next: ThemeChoice =
    current === "system" ? otherOf(os) : current === otherOf(os) ? os : "system";
  const nextLabel = labels[next];

  // The icon keys off `next` — what clicking DOES — never `current`.
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
