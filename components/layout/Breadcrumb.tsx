import Link from "next/link";

import type { Locale } from "@/lib/content/types";

export type Crumb = {
  /** Resolved label. A crumb with no label is dropped by the caller. */
  label: string;
  /** Omitted on the current page — the last crumb is not a link. */
  href?: string;
};

/**
 * Breadcrumb trail.
 *
 * Direction is not handled here and must not be: the separator sits between
 * items in source order, and `dir` on <html> mirrors the whole row. Reversing
 * the array or flipping the glyph for RTL would double-flip it.
 *
 * The separator is `aria-hidden` — a screen reader announcing "slash" between
 * every item is noise. The list semantics already convey the structure.
 */
export function Breadcrumb({
  crumbs,
  locale,
  label,
}: {
  crumbs: Crumb[];
  locale: Locale;
  /** aria-label from `ui_strings.breadcrumb_label`. */
  label?: string;
}) {
  const usable = crumbs.filter((c) => c.label);
  // One crumb is just the page you are on — a trail of length one is noise.
  if (usable.length < 2) return null;

  return (
    <nav aria-label={label} className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-meta text-fg-dim">
        {usable.map((crumb, i) => {
          const isLast = i === usable.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {crumb.href && !isLast ? (
                <Link
                  href={`/${locale}${crumb.href}`}
                  className="transition-colors hover:text-fg"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-fg-muted">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
