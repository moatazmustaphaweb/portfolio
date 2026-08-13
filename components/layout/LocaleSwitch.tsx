"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES, type Locale } from "@/lib/content/types";

/**
 * Language switch.
 *
 * Client-side only because it needs the current pathname to stay on the same
 * page across locales — switching language must never dump you back to the
 * home page.
 *
 * Labels arrive as props from the server (`ui_strings`), so this component
 * holds no copy. Each language is labelled in its OWN script — "English" and
 * "العربية" — so the switch is legible whichever locale you are currently in.
 * That is why both locales carry the same value for those two keys; it is
 * deliberate, not a seeding mistake.
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

  // Strip the leading locale segment so we can re-prefix it. Falls back to "/"
  // when the path is just the locale root.
  const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "";

  return (
    <div
      aria-label={ariaLabel}
      role="group"
      className="flex rounded-control border border-DEFAULT"
    >
      {LOCALES.map((code) => {
        const label = labels[code];
        if (!label) return null;

        const isActive = code === locale;
        return (
          <Link
            key={code}
            href={`/${code}${rest}`}
            hrefLang={code}
            aria-current={isActive ? "true" : undefined}
            className={[
              "tap-target-44 flex h-control-h-sm items-center px-3 text-meta transition-colors sm:text-ui",
              "first:rounded-s-control last:rounded-e-control",
              isActive
                ? "bg-surface-raised text-fg"
                : "text-fg-dim hover:text-fg",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
