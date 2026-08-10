"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Theme toggle. Labels come in as props from `ui_strings` — no copy here.
 *
 * The pre-paint script in the layout has already resolved and applied the
 * theme; this only handles user-initiated changes. It reads the resolved state
 * on mount rather than assuming a default, so the label matches what is
 * actually on screen even when the OS preference decided it.
 */
export function ThemeToggle({
  labels,
  ariaLabel,
}: {
  labels: { light?: string; dark?: string };
  ariaLabel?: string;
}) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const explicit = document.documentElement.getAttribute("data-theme");
    if (explicit === "light" || explicit === "dark") {
      setTheme(explicit);
      return;
    }
    setTheme(
      window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark",
    );
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing can reject writes. The theme still applies for this
      // page view; only persistence is lost.
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "light" ? "#ffffff" : "#000000");
  }

  // The button offers the theme you'd switch TO.
  const label = theme === "dark" ? labels.light : labels.dark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={ariaLabel}
      className="flex h-control-h-sm items-center rounded-control border border-DEFAULT px-3 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
    >
      {/*
        Rendered empty until mount so the server and client agree on markup;
        the label depends on the resolved theme, which only the browser knows.
      */}
      <span suppressHydrationWarning>{theme === null ? "" : label}</span>
    </button>
  );
}
