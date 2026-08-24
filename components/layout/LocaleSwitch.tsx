"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES, type Locale } from "@/lib/content/types";

/**
 * Language switch — one link, to the OTHER locale.
 *
 * Collapsed from a two-pill group 2026-08-24, task `029240826`, the same
 * request and the same reasoning as the theme toggle right next to it: fewer
 * controls in the header, on Moataz's explicit instruction.
 *
 * ── WHY THIS ONE NEEDED NO ACCESSIBILITY TRADE-OFF ──────────────────────────
 *
 * The theme toggle's three-way group existed because a single cycling button
 * cannot say where you ARE, only where you're going — and had to be answered
 * with a rebuilt `aria-label` on every render.
 *
 * A locale switch does not have that problem: there are only ever two
 * locales, so "the other one" is unambiguous, and the label shown IS the
 * destination — a link reading "العربية" while every surrounding word is
 * English is a self-evident pattern with no missing state to announce. This
 * was always effectively a single meaningful action (you never click the
 * pill for the locale you're already on); it was two elements presenting one
 * choice.
 *
 * Client-side only because it needs the current pathname to stay on the same
 * page across locales — switching language must never dump you back to the
 * home page.
 *
 * Labels arrive as props from the server (`ui_strings`), so this component
 * holds no copy. Each language is labelled in its OWN script — "English" and
 * "العربية" — so the link is legible whichever locale you are currently in.
 * That is why both locales carry the same value for those two keys; it is
 * deliberate, not a seeding mistake, and still true here — unchanged from
 * the old component.
 */
export function LocaleSwitch({
  locale,
  labels,
  ariaLabel,
}: {
  locale: Locale;
  labels: Partial<Record<Locale, string>>;
  ariaLabel?: string;
}) {
  const pathname = usePathname();

  const other = LOCALES.find((code) => code !== locale);
  const label = other ? labels[other] : undefined;

  if (!other || !label) return null;

  // Strip the leading locale segment so we can re-prefix it. Falls back to "/"
  // when the path is just the locale root.
  const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "";

  return (
    <Link
      href={`/${other}${rest}`}
      hrefLang={other}
      // Composed from two existing ui_strings, nothing invented (rule 7):
      // "Language" + the destination's own name, e.g. "Language: العربية".
      // The visible text already IS the destination, so this exists for a
      // screen reader, which has no visual "this is the language control"
      // context to lean on.
      aria-label={ariaLabel && label ? `${ariaLabel}: ${label}` : ariaLabel}
      className="tap-target-44 flex h-control-h-sm items-center rounded-control border border-DEFAULT px-3 text-meta text-fg-dim transition-colors hover:text-fg sm:text-ui"
    >
      {label}
    </Link>
  );
}
