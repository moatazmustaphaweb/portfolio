"use client";

import { useSyncExternalStore } from "react";

import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
} from "@/lib/theme/store";

/**
 * Theme toggle. Labels come in as props from `ui_strings` — no copy here.
 *
 * The pre-paint script in the root layout has already resolved and applied the
 * theme before this component exists; this only handles user-initiated
 * changes and reflects the current state in its label.
 *
 * The resolved theme is read from `lib/theme/store` rather than copied into
 * state on mount. It is a property of the document, not of this component —
 * and reading it that way also means the label now updates when the OS
 * appearance changes while the page is open, which it previously did not.
 */
export function ThemeToggle({
  labels,
  ariaLabel,
}: {
  labels: { light?: string; dark?: string };
  ariaLabel?: string;
}) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  // The button offers the theme you would switch TO.
  const label = theme === "dark" ? labels.light : labels.dark;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={ariaLabel}
      className="flex h-control-h-sm items-center rounded-control border border-DEFAULT px-3 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
    >
      {/*
        Empty until the browser answers. The server cannot know the theme, so
        `getThemeServerSnapshot` returns null and both the SSR and hydration
        passes render nothing here — then the real label arrives on the next
        render. No `suppressHydrationWarning`: there is no longer a mismatch to
        suppress, because the two passes genuinely agree.
      */}
      <span>{theme === null ? "" : label}</span>
    </button>
  );
}
