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
    /*
     * `mb-8` (32px), one step up the scale from `mb-6` (24px).
     *
     * SHARED. This is the gap between the breadcrumb and the first thing on
     * the page for every route that renders one — nine of them — so the fix is
     * made once here rather than per page. `mb-10` (40px) was the alternative
     * and opens a gap rather than letting the page breathe.
     */
    <nav aria-label={label} className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-meta text-fg-dim">
        {usable.map((crumb, i) => {
          const isLast = i === usable.length - 1;
          return (
            /*
             * `items-start`, not `items-center`. A crumb long enough to wrap
             * makes the li two lines tall, and centring floats the `/` in the
             * gap between them, belonging to neither. Arabic reaches this
             * first — "الاستحواذ في الخدمات المصرفية للشركات — مصر" wraps at
             * 320px where every English crumb still fits on one line.
             *
             * `min-w-0` + `break-words` are the guard behind it: a flex item
             * will not shrink below its min-content width by default, so a
             * single unbreakable token would push the row wide rather than
             * wrap. Nothing in the content hits that today.
             */
            <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-start gap-2">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {crumb.href && !isLast ? (
                <Link
                  href={`/${locale}${crumb.href}`}
                  className="break-words transition-colors hover:text-fg"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="break-words text-fg-muted">
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
