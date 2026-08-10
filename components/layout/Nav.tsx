import Link from "next/link";

import type { Locale, NavItem } from "@/lib/content/types";

/**
 * Navigation list, rendered from the `navigation` table. Labels are
 * translations — there is no literal in this file.
 *
 * An item whose label failed to resolve in both locales is skipped entirely
 * rather than rendered as an empty link, per the error-handling rule in
 * docs/conventions.md. An unlabelled link is a dead end.
 */
export function Nav({
  items,
  locale,
  ariaLabel,
  className,
  linkClassName,
}: {
  items: NavItem[];
  locale: Locale;
  ariaLabel?: string;
  className?: string;
  linkClassName?: string;
}) {
  const labelled = items.filter((item) => item.fields.label);
  if (labelled.length === 0) return null;

  return (
    <nav aria-label={ariaLabel} className={className}>
      {labelled.map((item) => (
        <Link
          key={item.id}
          href={`/${locale}${item.route}`}
          className={linkClassName}
        >
          {item.fields.label}
        </Link>
      ))}
    </nav>
  );
}
