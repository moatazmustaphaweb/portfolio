import { CloudinaryImage } from "@/components/media/CloudinaryImage";
import { SectionTable } from "@/components/layout/ProseSections";
import { dirForLocale } from "@/lib/content/types";
import type { ChapterSection, Locale, Media } from "@/lib/content/types";

/**
 * A chapter's slots, rendered in the order the database holds them.
 *
 * The counterpart of `CoverSections`, and the render half of migration 0035.
 *
 * ── WHAT THIS REPLACES ──────────────────────────────────────────────────────
 *
 * Four hardcoded blocks — objective, context, evidence_note, result — each
 * keyed to a fixed field. A chapter section whose heading was not one of six
 * known names never reached the database at all, so it could not be rendered
 * however the composition was written. On Chapter One that was `What I
 * designed`, `The interface` and `The fight I lost` — and nine of its sixteen
 * figures.
 *
 * ── WHY A FIGURE IS A SIBLING, NOT A CHILD ──────────────────────────────────
 *
 * Each paragraph is its own row and its own element. A paragraph whose stored
 * body is `[image:<uuid>]` becomes a <figure>; everything else becomes a <p>.
 * They are SIBLINGS.
 *
 * That is not a style choice. <figure> is flow content and is invalid inside
 * <p>: a browser meeting one closes the paragraph early and reparents the rest,
 * so the page renders *almost* right and the bug is very hard to see. Keeping
 * paragraphs as rows means there is no <p> to nest inside — the invalid markup
 * is unreachable rather than merely avoided.
 *
 * ── RTL, AND THE ONE THING THIS FILE DOES SET ───────────────────────────────
 *
 * Every utility here is symmetric (`mx-`, `mt-`, `max-w-`) or logical. There is
 * no directional margin, padding, border or alignment anywhere in this file, so
 * there is nothing to mirror and nothing that can silently sit on the wrong
 * side in Arabic.
 *
 * `dir` and `lang` ARE set on each text element, from the language that text is
 * written in — never from the page's locale (decision 053). LAYOUT direction
 * still comes from the locale, once, on <html>, and nothing here branches on it.
 * TEXT direction comes from the text.
 *
 * Without this, decision 013's English fallback lands inside a `dir="rtl"`
 * document and the browser lays it out as Arabic: the trailing full stop
 * resolves to the wrong visual side, so the sentence renders as
 * ".This is where the whole design meets its limit" and the paragraph aligns
 * right. 73 paragraphs and 31 captions did exactly that.
 */
export function ChapterSections({ sections }: { sections: ChapterSection[] }) {
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        /*
         * A slot with a heading and no blocks renders nothing at all.
         *
         * An ABSENT slot is silent and correct; an EMPTY one is a heading with
         * nothing under it, and showing a lone heading reads as a page that
         * failed to load rather than as content that was never written.
         */
        if (section.blocks.length === 0) return null;

        return (
          <section
            key={section.id}
            /*
             * The slot IS the anchor. The accessibility page's contents rail
             * links to `#the-position`, which survives a re-sync and a reworded
             * heading — the old heading-derived slug survived neither.
             */
            id={section.slot}
            className="mt-14 scroll-mt-24 border-t border-DEFAULT pt-8"
            data-slot={section.slot}
          >
            {/*
             * The heading as written, in this locale. No default is invented:
             * where a locale has no heading translation the section still
             * renders its prose, because the writing is the content and the
             * heading is a label for it.
             */}
            {section.heading ? (
              <h2
                lang={section.headingLang}
                dir={section.headingLang ? dirForLocale(section.headingLang) : undefined}
                className="font-mono text-section uppercase text-fg-dim"
              >
                {section.heading}
              </h2>
            ) : null}

            <div className="mt-5 space-y-6">
              {section.blocks.map((block, i) => {
                if (block.kind === "prose") {
                  return (
                    <p
                      key={`p-${section.id}-${i}`}
                      lang={block.lang}
                      dir={dirForLocale(block.lang)}
                      className="max-w-measure whitespace-pre-line text-body text-fg-body"
                    >
                      {block.text}
                    </p>
                  );
                }
                if (block.kind === "image") {
                  return <ChapterFigure key={`f-${section.id}-${i}`} media={block.media} />;
                }
                /*
                 * ⚠️ The SAME `SectionTable` the document pages have always
                 * used, fed the same tab-and-newline string. Not a
                 * reimplementation — on the comparison pages the table IS the
                 * page, and a second renderer would be free to drift from the
                 * first. There is nothing here to drift.
                 *
                 * The wrapper carries `lang`/`dir` and `display: contents`, so
                 * `direction` inherits into the table and an Arabic table
                 * mirrors — row headers to the right, columns reading
                 * right-to-left. That IS correct for an Arabic table: the
                 * logical column order is unchanged, only its presentation.
                 * A table served by the English fallback stays `ltr` and does
                 * not mirror, which is the whole point of taking direction from
                 * the text rather than the page.
                 */
                return (
                  <div
                    key={`t-${section.id}-${i}`}
                    lang={block.lang}
                    dir={dirForLocale(block.lang)}
                    /*
                     * `display: contents` — the wrapper carries the language and
                     * then gets out of the way. A real box here would take the
                     * parent's `space-y-6` margin while the table kept its own
                     * `mt-10`, quietly doubling the gap above every table.
                     * `direction` and `lang` still inherit through it.
                     */
                    className="contents"
                  >
                    <SectionTable body={block.body} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}

/**
 * One figure: the screen, and the caption that says why it is here.
 *
 * ⚠️ A figure with no caption renders NOTHING, and that is deliberate.
 *
 * `CloudinaryImage` already omits an image whose `alt` translation is missing,
 * so an unlabelled screen cannot ship. Rendering an empty <figure> around that
 * omission would leave a caption floating under nothing, which looks like a
 * broken page rather than an absent one. The whole figure is the unit, so the
 * whole figure is what is withheld.
 *
 * The image carries no frame — no border, no rounding, no background. Screens
 * sit directly on the page (2026-08-23, task `001230826`).
 *
 * The NDA grayscale is NOT applied here. It rides on `media.nda`, stamped by
 * the content layer from `case_files.nda`, and is applied inside
 * `CloudinaryImage` — so this component cannot forget it and cannot override
 * it (amendment 036).
 */
function ChapterFigure({ media }: { media: Media | null }) {
  if (!media) return null;

  const caption = media.fields.caption;
  /*
   * The caption's own language. A media row referenced only by the English page
   * has no Arabic caption, so an Arabic reader gets the English one — correct
   * content, and it must not be laid out as Arabic.
   */
  const captionLang: Locale | undefined = media.fieldLocales.caption;

  return (
    <figure className="mt-8">
      <CloudinaryImage
        media={media}
        preset="gallery"
        className="h-auto w-full max-w-full"
      />
      {caption ? (
        <figcaption
          lang={captionLang}
          dir={captionLang ? dirForLocale(captionLang) : undefined}
          className="mt-3 max-w-measure text-meta text-fg-muted"
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
