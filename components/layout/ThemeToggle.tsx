"use client";

import { useRef, useSyncExternalStore, type ReactElement } from "react";

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
 * Theme control — System · Light · Dark, with System as the default.
 *
 * Labels come in as props from `ui_strings`; no copy here.
 *
 * ── WHY THREE BUTTONS AND NOT A CYCLING TOGGLE ──────────────────────────────
 *
 * The old control was a single button that swapped between two states and
 * labelled itself with the state you would move TO. That does not extend: with
 * three states a cycling button cannot say where you are, only where you are
 * going next, and "System" is a state whose whole meaning is what it currently
 * resolves to. Three radios say both at once.
 *
 * `role="radiogroup"` with `aria-checked`, so the current state is ANNOUNCED
 * rather than conveyed by the highlight alone — the same rule the accent lives
 * under everywhere else on this site. Each option is a real button: tabbable,
 * activated by Enter or Space, and carrying the focus ring every interactive
 * element gets.
 *
 * ── STATE ───────────────────────────────────────────────────────────────────
 *
 * The control reflects the CHOICE, not the resolved theme. Those differ: with
 * System selected on a light OS, the choice is `system` and the paint is
 * `light`. Highlighting `Light` there would be a lie about what happens when
 * the OS changes.
 *
 * The pre-paint script in the root layout has already resolved and applied the
 * theme before this component exists. This only handles user-initiated
 * changes.
 */
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

  const options = (
    [
      { value: "system", label: labels.system, Icon: AutoThemeIcon },
      { value: "light", label: labels.light, Icon: LightThemeIcon },
      { value: "dark", label: labels.dark, Icon: DarkThemeIcon },
    ] as { value: ThemeChoice; label?: string; Icon: (p: { className?: string }) => ReactElement }[]
  ).filter((o): o is { value: ThemeChoice; label: string; Icon: (p: { className?: string }) => ReactElement } =>
    Boolean(o.label),
  );

  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = options.findIndex((o) => o.value === choice);

  /*
    A radiogroup owes a keyboard contract, and half of one is worse than none:
    arrow keys move between options and select as they go, and only one option
    is in the tab order — a roving tabindex — so Tab enters and leaves the
    group rather than stepping through every option. Home/End jump to the ends.
    Enter and Space come free from using real <button> elements.
  */
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    let next: number | null = null;

    if (back) next = (index - 1 + options.length) % options.length;
    else if (forward) next = (index + 1) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;

    if (next === null) return;
    event.preventDefault();
    setThemeChoice(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      /*
        NOT `overflow-hidden`. It would clip the 44px hit area — and clip
        hit-testing, not just paint, so the target would look extended and
        silently not be. The end children round themselves instead, with
        logical `rounded-s`/`rounded-e` so it mirrors.
      */
      className="flex rounded-control border border-DEFAULT"
    >
      {options.map(({ value, label, Icon }, index) => {
        /*
          `choice` is null until the browser answers — the server cannot know
          it. Nothing is marked selected during SSR and hydration, which is the
          honest rendering rather than guessing a default and correcting it.
        */
        const isActive = choice === value;

        return (
          <button
            key={value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            /* Roving: the checked option holds the tab stop. Before the
               browser answers, the first option holds it so the group is
               always reachable. */
            tabIndex={index === (checkedIndex === -1 ? 0 : checkedIndex) ? 0 : -1}
            onClick={() => setThemeChoice(value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            /*
              The visible text is gone; the accessible name is not. It is the
              same `ui_strings` value the label used, so the control is still
              named from the database in both locales (rule 1) — an icon does
              not get to be quieter than the word it replaced.
            */
            aria-label={label}
            className={[
              "tap-target-44 flex h-control-h-sm items-center px-3 transition-colors",
              "first:rounded-s-control last:rounded-e-control",
              isActive
                ? "bg-surface-raised text-fg"
                : "text-fg-dim hover:text-fg",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
