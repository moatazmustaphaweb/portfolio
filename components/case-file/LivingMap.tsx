import Link from "next/link";

import type { Chapter, Grammar, Locale } from "@/lib/content/types";
import { dirForLocale } from "@/lib/content/types";

/**
 * The chapter map.
 *
 * MVP-1 is deliberately plain (decision 023): this renders a clear structural
 * list, not a diagram. No positioned nodes, no connector lines, no SVG.
 *
 * It still branches on `grammar`, and that is the point of building it now.
 * The three grammars describe genuinely different structures — a journey has
 * an order, an ecosystem has a centre, a design system has a hierarchy — and
 * the data shape that expresses each has to be right today even though all
 * three currently render as a list. Phase 2 replaces the presentation, not the
 * model.
 */

/** What each grammar means for how chapters relate to one another. */
const GRAMMAR_SHAPE: Record<Grammar, { ordered: boolean; numbered: boolean }> = {
  // A journey through a market: sequence carries the meaning.
  "country-culture": { ordered: true, numbered: true },
  // A platform and the things orbiting it: order is arbitrary.
  ecosystem: { ordered: false, numbered: false },
  // A documentation tree: ordered, but numbering implies a path that
  // documentation does not have.
  "design-system": { ordered: true, numbered: false },
};

export function LivingMap({
  chapters,
  caseFileSlug,
  grammar,
  locale,
  chapterLabel,
}: {
  chapters: Chapter[];
  caseFileSlug: string;
  grammar: Grammar;
  locale: Locale;
  /** `ui_strings.chapter` — the word, for the numbered form. */
  chapterLabel?: string;
}) {
  if (chapters.length === 0) return null;

  const shape = GRAMMAR_SHAPE[grammar] ?? GRAMMAR_SHAPE.ecosystem;

  /*
   * `<ol>` vs `<ul>` is the grammar's first real consequence, and it is not
   * decoration: a screen reader announces an ordered list as a sequence. For
   * an ecosystem — a platform and the things orbiting it — that would assert a
   * first and a last where the work has neither.
   */
  const List = shape.ordered ? "ol" : "ul";

  return (
    <List className="flex flex-col gap-px overflow-hidden rounded-panel border border-DEFAULT bg-border">
      {chapters.map((chapter, i) => {
        const title = chapter.fields.title;
        if (!title) return null;

        return (
          <li key={chapter.id}>
            <Link
              href={`/${locale}/work/${caseFileSlug}/${chapter.slug}`}
              className="flex flex-col gap-2 bg-surface p-card-p transition-colors hover:bg-surface-raised"
            >
              {/*
                Numbering only where sequence is meaningful. An ecosystem
                numbered 01–03 would assert an order the work does not have.
              */}
              {shape.numbered ? (
                <span className="font-mono text-micro uppercase text-fg-dim">
                  {chapterLabel ? `${chapterLabel} ` : ""}
                  {String(i + 1).padStart(2, "0")}
                </span>
              ) : null}

              <span className="text-h3 text-fg">{title}</span>

              {chapter.fields.objective ? (
                <span
                  className="max-w-measure text-body-sm text-fg-muted"
                  lang={chapter.fieldLocales.objective}
                  dir={
                    chapter.fieldLocales.objective
                      ? dirForLocale(chapter.fieldLocales.objective)
                      : undefined
                  }
                >
                  {chapter.fields.objective}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </List>
  );
}
