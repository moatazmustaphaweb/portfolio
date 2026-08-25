import { CloudinaryImage } from "@/components/media/CloudinaryImage";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { SectionLink } from "@/components/layout/SectionLink";
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
export function ChapterSections({
  sections,
  linkLabels,
  device,
}: {
  sections: ChapterSection[];
  /*
   * Wrap every figure in this chapter in a laptop frame.
   *
   * OFF by default and switched on per chapter by the route, not by the
   * content. It is a property of the WORK, not of the picture: Cervello is a
   * desktop platform, so a laptop is the truthful container. The mobile case
   * files would be lying inside one, and no `[cld]` tag should have to know
   * which.
   */
  device?: boolean;
  /*
   * `ui_strings.copy_section_link` and `.section_link_copied`, resolved on the
   * server and passed down — this component is a server component and cannot
   * call `getUiStrings` from inside the client button. Optional: absent means
   * no link button, which is how every caller that has not been updated keeps
   * working unchanged.
   */
  linkLabels?: { copy?: string; copied?: string };
}) {
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
            className="mt-14 scroll-mt-18 border-t border-DEFAULT pt-8"
            data-slot={section.slot}
          >
            {/*
             * The heading as written, in this locale. No default is invented:
             * where a locale has no heading translation the section still
             * renders its prose, because the writing is the content and the
             * heading is a label for it.
             */}
            {section.heading ? (
              /*
               * The button is a SIBLING of the heading text inside the <h2>,
               * not a wrapper around it. `lang`/`dir` stay on the <h2> where
               * they were — the heading is still one element carrying one
               * language, and the button carries no prose of its own (its name
               * comes from `aria-label`).
               */
              <h2
                lang={section.headingLang}
                dir={section.headingLang ? dirForLocale(section.headingLang) : undefined}
                className="font-mono text-section uppercase text-fg-dim"
              >
                {section.heading}
                {linkLabels ? (
                  <SectionLink
                    targetId={section.slot}
                    label={linkLabels.copy}
                    copiedLabel={linkLabels.copied}
                  />
                ) : null}
              </h2>
            ) : null}

            <div className="mt-5 space-y-6">
              {section.blocks.map((block, i) => {
                if (block.kind === "prose") {
                  /*
                   * NO `max-w-measure`. Nothing ever sits beside a chapter
                   * paragraph — a figure here is a SIBLING, never a neighbour
                   * (see the note above), so there is no second column for a
                   * reading-width cap to share the row with. It was capping
                   * every paragraph at 68ch (~721px) inside a container up to
                   * 1152px, which is the same defect fixed on the cover in
                   * `033240826` / `034240826`, one file over: a narrow column
                   * with empty space beside it and nothing to explain it.
                   *
                   * The paragraph now fills whatever container the page gives
                   * it. That container is NOT this file's concern and was not
                   * touched — `[chapter]/page.tsx` still chooses `max-w-prose`
                   * or `max-w-container` by chapter kind, exactly as before.
                   */
                  return (
                    <p
                      key={`p-${section.id}-${i}`}
                      lang={block.lang}
                      dir={dirForLocale(block.lang)}
                      className="whitespace-pre-line text-body text-fg-body"
                    >
                      {block.text}
                    </p>
                  );
                }
                if (block.kind === "image") {
                  return (
                    <ChapterFigure
                      key={`f-${section.id}-${i}`}
                      media={block.media}
                      device={device}
                    />
                  );
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
 * Sizing is two rules, not one. Below `md` the image takes the full column and
 * its height follows its aspect ratio. From `md` up the HEIGHT is capped at
 * `--figure-max-h` and the width becomes `auto`, so the aspect ratio is kept
 * and a square mockup stops being a thousand-pixel wall between two paragraphs.
 *
 * `me-auto` and not `mr-auto`: once the image is narrower than its column it
 * has to hug the inline start, which is the left in English and the right in
 * Arabic. `block` is what makes that margin apply at all — an inline image
 * would take its position from the ancestor's `text-align` instead.
 *
 * The NDA grayscale is NOT applied here. It rides on `media.nda`, stamped by
 * the content layer from `case_files.nda`, and is applied inside
 * `CloudinaryImage` — so this component cannot forget it and cannot override
 * it (amendment 036).
 */
function ChapterFigure({
  media,
  device,
}: {
  media: Media | null;
  device?: boolean;
}) {
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
      {(() => {
        /*
          The image is identical either way. Only its container changes, so the
          NDA treatment, the alt omission and the sizing rules all keep working
          without the frame knowing anything about them.

          `me-auto` moves to the FRAME when there is one: the thing that has to
          hug the inline start is the outer edge, and leaving it on the image
          would centre the picture inside a frame that is itself flush left.

          The framed variant also drops `max-h-figure`. That cap exists to stop
          a tall unframed screenshot becoming a wall between two paragraphs; the
          frame already fixes the height by fixing the shape, so applying both
          would shrink the picture away from the bezel it is supposed to fill.
        */
        const img = (
          <CloudinaryImage
            media={media}
            preset="gallery"
            className={
              /*
                Framed, the picture is NOT cropped. The frame follows its
                contents (see `DeviceFrame`), so the image keeps its own aspect
                ratio and the bezel wraps whatever shape arrives. An earlier
                version forced `h-full w-full object-cover` against a fixed
                786x522 screen; that shape is gone, and `object-cover` with no
                height to cover collapses the picture.
              */
              device
                ? "block h-auto w-full"
                : "me-auto block h-auto w-full max-w-full md:max-h-figure md:w-auto"
            }
          />
        );
        return device ? <DeviceFrame>{img}</DeviceFrame> : img;
      })()}
      {caption ? (
        <figcaption
          lang={captionLang}
          dir={captionLang ? dirForLocale(captionLang) : undefined}
          className={
            /*
              Framed, the caption is a chip: it hugs its own text rather than
              running the column width, so it reads as a label attached to the
              device above it rather than as the paragraph that follows.

              `w-fit` is what makes it hug — a figcaption is a block element and
              would otherwise fill the line box, and a full-width pill is not a
              chip. `max-w-measure` still caps it, so a long caption wraps to a
              second line inside the chip instead of running off the frame.

              Padding is `px-3 py-1`, the same as every other pill on the site
              (ProjectCard, PreviewIndex, RedactedEvidence). Off-scale values
              like `py-1.5` do not exist here — the spacing scale is REPLACED,
              not extended, so they compile to nothing and the chip silently
              loses its padding.

              Unframed captions are unchanged. The chip belongs to the device
              treatment, which is live on one chapter while its look is being
              agreed; widening it to all 57 Egypt figures is a separate call.
            */
            device
              ? "mt-3 w-fit max-w-measure rounded-pill border border-DEFAULT bg-surface px-3 py-1 text-meta text-fg-muted"
              : "mt-3 max-w-measure text-meta text-fg-muted"
          }
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
