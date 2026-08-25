import { CloudinaryImage } from "@/components/media/CloudinaryImage";
import { DeviceFrame, LAPTOP_FRAME_MAX_W } from "@/components/media/DeviceFrame";
import { PhoneFrame, PHONE_FRAME_MAX_W } from "@/components/media/PhoneFrame";
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
}: {
  sections: ChapterSection[];
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
function ChapterFigure({ media }: { media: Media | null }) {
  if (!media) return null;

  /*
   * ── WHICH PICTURES GET THE LAPTOP ───────────────────────────────────────
   *
   * The frame is a claim: "this is a screen on a computer." So the thing that
   * decides has to be evidence about the picture, and the only evidence there
   * is, is its shape. A landscape screenshot is a desktop screen. A portrait
   * one is a phone, an emailer, or a page of a form, and none of those belong
   * inside a laptop.
   *
   * WHY NOT THE ROUTE. This used to be `caseFile === "cervello" && chapter ===
   * "permission-architecture"` — a slug written into a page. It was fine as a
   * trial and wrong as a rule: every journey has web screens in it, and the
   * mobile case files carry desktop screens too.
   *
   * WHY NOT THE FOLDER NAME. Tempting, because the Cloudinary paths say
   * "Mobile". Measured, they lie: inside `00. UAE NEOBIZ - Mobile - Jul 27`
   * there are 786x1704 phone screens sitting beside 1600x1200 and 4322x4323
   * boards. A folder is a filing convention, not a fact about the image.
   *
   * THE THRESHOLD IS DELIBERATELY STRICT. 0.9, not 1.0. Across the 161 media
   * rows the shapes fall into 91 clearly landscape (< 0.9), 47 clearly
   * portrait (>= 1.3), and 23 square or nearly so. A square is not evidence of
   * a desktop screen, so it does not get the claim — an unframed picture is
   * merely plain, while a wrongly framed one asserts something untrue.
   *
   * A row with no dimensions is also left unframed. Before migration 0060 that
   * was 152 of 161 rows; if it happens again — the Notion sync still creates
   * media without dimensions — the figures go plain rather than wrong.
   */
  const ratio =
    media.width && media.height ? media.height / media.width : null;
  const laptop = ratio !== null && ratio < 0.9;
  /*
   * The phone takes the other end of the same measurement. 1.7 rather than the
   * laptop's mirror image, because the frame is drawn around a 786x1704 screen
   * (ratio 2.17) and anything appreciably squarer than that would sit in it
   * with bands of bezel above and below. The 23 square-ish rows fall between
   * the two thresholds and stay plain, which is the intended outcome: neither
   * claim is supported by a square.
   */
  const phone = ratio !== null && ratio >= 1.7;
  const device = laptop || phone;

  const caption = media.fields.caption;
  /*
   * The caption's own language. A media row referenced only by the English page
   * has no Arabic caption, so an Arabic reader gets the English one — correct
   * content, and it must not be laid out as Arabic.
   */
  const captionLang: Locale | undefined = media.fieldLocales.caption;

  return (
    /*
      Framed, the figure becomes the positioning context for its own caption and
      carries its own margins on both sides. The caption is taken out of flow so
      it can sit ON the frame's bottom line, which means the figure no longer
      reserves room for it — without the bottom margin the next paragraph runs
      underneath it, and without a matching top margin two consecutive frames
      end up separated only by the overhanging chip.

      ⚠️ THE `!` IS LOAD-BEARING. THIS FIGURE'S PLAIN `mt-*` NEVER APPLIED.

      The parent is `<div className="mt-5 space-y-6">` (line 133). `space-y-6`
      compiles to `.space-y-6 > :not([hidden]) ~ :not([hidden])`, which outranks
      a bare `.mt-8` on the child, so EVERY figure on every chapter has been
      spaced at the container's 24px since it was written — the `mt-8` here was
      dead the whole time, and so were the `mt-14` and `mb-14` that replaced it
      earlier in this same task. `space-y` also forces `margin-bottom: 0`, which
      is why the bottom margin never did anything either.

      Measured, not reasoned: `mt-22` resolves to 88px on a bare element and to
      24px on this figure. That gap between the two readings is the bug.

      The same conflict is already documented for the table at line 195, where
      it was solved with `display: contents`. That does not transfer — the table
      wanted the container's rhythm and this figure needs to escape it.

      40px. 88px was the first value that was ever actually APPLIED here, and
      seeing it applied showed it was too much — the halving is a correction to
      a number that had only ever been theoretical.

      Half of 88 is 44 and 44 does not exist: the spacing scale is REPLACED, so
      it runs 32 · 40 · 56 · 72 · 88 with nothing between. 40 is the nearest
      step and it is the one taken. Do not reach for an arbitrary value to hit
      44 exactly — the whole point of a replaced scale is that off-system
      numbers are unreachable.
    */
    <figure
      className={device ? "relative !mt-10 !mb-10" : "mt-8"}
      /*
        The figure is capped to the FRAME's own width, not left at the column's.

        The floating caption centres on its positioning context, which is this
        element. A laptop fills the column so the two agreed by accident; a
        phone is 320px inside a 950px column, and the chip was centring hundreds
        of pixels to the side of the device it belongs to.

        `w-fit` was tried first and collapsed the figure to ZERO: the frame
        inside is `w-full`, and a percentage width against a `fit-content`
        parent is circular. The cap has to be a real number, so each frame
        exports its own and this reads it — one constant with two readers
        rather than 320 written down twice.
      */
      style={device ? { maxWidth: phone ? PHONE_FRAME_MAX_W : LAPTOP_FRAME_MAX_W } : undefined}
    >
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
        if (phone) return <PhoneFrame>{img}</PhoneFrame>;
        return laptop ? <DeviceFrame>{img}</DeviceFrame> : img;
      })()}
      {caption ? (
        <figcaption
          lang={captionLang}
          dir={captionLang ? dirForLocale(captionLang) : undefined}
          className={
            /*
              Framed, the caption is a chip floating on the frame's bottom line.

              THE STYLE IS THE SITE'S CHIP, FLAT. `border border-DEFAULT px-3
              py-1 font-mono text-micro text-fg-dim` is exactly what the gallery
              cards, PreviewIndex, StubPage and RedactedEvidence already use —
              one chip treatment, not a second one invented here. The single
              departure is the radius: `rounded-control` (6px) instead of
              `rounded-pill` (999px) — softened rather than fully round, and
              still one of the system's three radii rather than a new number.

              `uppercase` is dropped with it. Every existing chip is a one-word
              label (`FINTECH`, `NDA`) and upper-cases cleanly; a caption is a
              sentence, and a shouted sentence is not the voice.

              `bg-surface` is not decoration — the chip straddles the frame's
              edge, so half of it sits over the screenshot. Without an opaque
              fill the text reads against whatever pixels happen to be there.

              POSITION, AND IT IS NOT THE SAME ON A PHONE.

              From `md` up it floats: `inset-x-0` + `mx-auto` + `w-fit` centres
              it without naming a physical side, so it is identical in LTR and
              RTL — `left-1/2` with a negative translate would have been a
              direction trap. `bottom-0 translate-y-1/2` puts its centre on the
              frame's bottom line.

              Below `md` it does NOT float. A chip that covers a tenth of a
              1440px screenshot covers a third of a 320px one, and the thing it
              covers is the picture the caption exists to describe. So on a
              phone it drops out of the overlay and sits under the frame in
              normal flow — the mobile default, with the floating behaviour
              added at `md` rather than removed below it, because a phone is
              where the harm was.

              `md:mt-0` is not tidiness: the static caption's `mt-3` would
              otherwise still be in the box once it goes absolute, pushing it
              off the line it is supposed to sit on.

              Off-scale spacing does not exist here — the scale is REPLACED, not
              extended, so `py-1.5` would compile to nothing and the chip would
              silently lose its padding.

              Unframed captions are unchanged. This belongs to the device
              treatment, live on one chapter while its look is being agreed.
            */
            device
              ? "mx-auto mt-3 w-fit max-w-measure rounded-control border border-DEFAULT bg-surface px-3 py-1 text-center font-mono text-micro text-fg-dim md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:translate-y-1/2"
              : "mt-3 max-w-measure text-meta text-fg-muted"
          }
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
