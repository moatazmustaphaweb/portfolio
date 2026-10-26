import { CloudinaryImage } from "@/components/media/CloudinaryImage";
import { DeviceFrame, LAPTOP_FRAME_MAX_W } from "@/components/media/DeviceFrame";
import { PhoneFrame, PHONE_FRAME_MAX_W } from "@/components/media/PhoneFrame";
import { SectionLink } from "@/components/layout/SectionLink";
import { SectionTable } from "@/components/layout/ProseSections";
import { dirForLocale } from "@/lib/content/types";
import type {
  ChapterSection,
  DeviceFrame as DeviceFrameKind,
  ImageLayout,
  Locale,
  Media,
} from "@/lib/content/types";

/**
 * A section's blocks, with every run of 2+ consecutive RENDERABLE figures
 * folded into one group. Used only when the chapter's layout is "grid".
 *
 * Renderable means `media` is present — a null-media figure renders nothing,
 * so a run of [figure, missing, figure] is a run of two, and a run of
 * [figure, missing] is a lone figure and renders exactly as it does stacked.
 *
 * Each item keeps the index it had in `blocks`, so React keys stay what the
 * stacked renderer gives them. Grouping is by ADJACENCY in the order the
 * database holds — never by pairing two lists — so nothing here can attach a
 * caption or a screen to the wrong neighbour.
 */
type BlockUnit =
  | { kind: "block"; block: ChapterSection["blocks"][number]; i: number }
  | { kind: "grid"; figures: { media: Media; i: number }[] };

function groupFigureRuns(blocks: ChapterSection["blocks"]): BlockUnit[] {
  const units: BlockUnit[] = [];
  let run: { block: ChapterSection["blocks"][number]; i: number }[] = [];
  const flush = () => {
    const figures = run.flatMap(({ block, i }) =>
      block.kind === "image" && block.media ? [{ media: block.media, i }] : [],
    );
    if (figures.length >= 2) units.push({ kind: "grid", figures });
    else for (const r of run) units.push({ kind: "block", ...r });
    run = [];
  };
  blocks.forEach((block, i) => {
    if (block.kind === "image") run.push({ block, i });
    else {
      flush();
      units.push({ kind: "block", block, i });
    }
  });
  flush();
  return units;
}

/**
 * ── EDITORIAL (decision 068, task `012261026`) ──────────────────────────────
 *
 * Within a section, each RENDERABLE figure is paired with the prose blocks
 * written since the previous figure (or since the start of the section). Prose
 * after the last figure stays a plain block. A table breaks the run: the prose
 * before it renders as plain blocks and the table renders as it always has —
 * only paragraphs (and lists, which are paragraphs here) are pulled into a
 * pair. Decision cards are not section blocks at all; the page renders them
 * between the two `ChapterSections` calls, untouched.
 *
 * A null-media figure renders nothing, so it cannot anchor a pair. The prose
 * leading into it is flushed as plain blocks rather than carried forward to
 * the NEXT figure — carrying it would attach a paragraph to a screen it was
 * not written about.
 *
 * Pairing is by ADJACENCY in the order the database holds, never by index
 * across two lists (docs/learn.md Part 5).
 */
type BlockRef = { block: ChapterSection["blocks"][number]; i: number };

type EditorialUnit =
  | { kind: "block"; block: ChapterSection["blocks"][number]; i: number }
  | { kind: "pair"; prose: BlockRef[]; media: Media; i: number; beside: boolean };

/**
 * Narrow = portrait or square: width / height <= 1.15, from the media row's
 * own stored dimensions. Unknown dimensions are treated as WIDE, which renders
 * exactly as stacked — the safe reading when there is no evidence.
 */
const EDITORIAL_NARROW_MAX_RATIO = 1.15;

function isNarrowFigure(media: Media): boolean {
  if (!media.width || !media.height) return false;
  return media.width / media.height <= EDITORIAL_NARROW_MAX_RATIO;
}

function groupEditorialUnits(blocks: ChapterSection["blocks"]): EditorialUnit[] {
  const units: EditorialUnit[] = [];
  let pending: BlockRef[] = [];
  const flush = () => {
    for (const p of pending) units.push({ kind: "block", ...p });
    pending = [];
  };
  blocks.forEach((block, i) => {
    if (block.kind === "prose") {
      pending.push({ block, i });
    } else if (block.kind === "image" && block.media) {
      /*
       * BESIDE only when the text column would hold something. A narrow figure
       * with no prose before it and no caption would put the image beside an
       * empty track (learn.md Part 5, "a container that loses a child keeps
       * its tracks"), so that case renders stacked and takes no side.
       */
      const beside =
        isNarrowFigure(block.media) && (pending.length > 0 || Boolean(block.media.fields.caption));
      units.push({ kind: "pair", prose: pending, media: block.media, i, beside });
      pending = [];
    } else {
      flush();
      units.push({ kind: "block", block, i });
    }
  });
  flush();
  return units;
}

/**
 * How many figures in these sections take a side. The page splits a chapter's
 * sections around the decision cards and renders them with two
 * `ChapterSections` calls; the second call starts its alternation from this
 * count, so the sides alternate across the whole chapter rather than
 * restarting after the decisions. Same grouping function as the renderer, so
 * the count and the render cannot disagree.
 */
export function countEditorialBesideFigures(sections: ChapterSection[]): number {
  let n = 0;
  for (const section of sections)
    for (const unit of groupEditorialUnits(section.blocks))
      if (unit.kind === "pair" && unit.beside) n++;
  return n;
}

type EditorialSide = "start" | "end";

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
  deviceFrame = "iphone",
  imageLayout = "stacked",
  editorialOffset = 0,
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
  /*
   * Which phone this chapter's PORTRAIT screenshots are framed in — authored
   * per chapter (`chapters.device_frame`, task `003221026`). It chooses the
   * phone's variant only: whether a picture gets a phone, a laptop or no
   * frame is still decided by its own aspect ratio in `ChapterFigure`.
   * Optional, default "iphone", so a caller that does not pass it renders
   * exactly what it did before the column existed.
   */
  deviceFrame?: DeviceFrameKind;
  /*
   * `chapters.image_layout`, task `004221026`. Optional, default "stacked",
   * and "stacked" renders byte-for-byte what this component rendered before
   * the prop existed — the grid path is a separate branch, not a variation
   * of the stacked one. "editorial" (decision 068) is a third branch; its wide
   * figures render item for item as stacked does.
   */
  imageLayout?: ImageLayout;
  /*
   * Editorial only: how many side-placed figures came before this call in the
   * same chapter (see `countEditorialBesideFigures`). Default 0, so a single
   * call starts with the figure on the inline-start side.
   */
  editorialOffset?: number;
}) {
  if (sections.length === 0) return null;

  /*
   * Editorial alternation counter. Even → figure at inline-start (prose at
   * inline-end), odd → figure at inline-end (task `012261026`, flipped at
   * Moataz's review: the first narrow figure leads from the reading edge).
   * Advanced only by figures that actually take a side, in render order.
   */
  let besideCount = editorialOffset;

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
              {imageLayout === "grid"
                ? groupFigureRuns(section.blocks).map((unit) =>
                    unit.kind === "block" ? (
                      renderBlock(section, unit.block, unit.i, deviceFrame)
                    ) : (
                      /*
                       * A run of screenshots, side by side: 1 column below
                       * `md` (768), 2 from `md`, 3 from `lg` (1024) — the
                       * project's own breakpoints, nothing added.
                       *
                       * `!my-10` for the reason the framed figure carries
                       * `!mt-10 !mb-10`: the parent's `space-y-6` outranks a
                       * bare margin on a child, so without `!` the run would
                       * sit 24px from its prose instead of the 40px a single
                       * framed figure gets.
                       *
                       * Gap: 24px across (`gap-x-6`, the container's own
                       * rhythm) and 40px down (`gap-y-10`, the same step as a
                       * framed figure's margin), so the rows of a run are
                       * spaced like the figures of a stacked chapter.
                       *
                       * No direction anywhere: grid auto-placement follows
                       * `direction`, so in Arabic the first screenshot takes
                       * the right-hand cell and the run reads right to left
                       * without this file knowing which locale it is in.
                       *
                       * `items-start` because captions differ in length; a
                       * stretched row would pad every short caption's figure
                       * to the tallest one's height.
                       */
                      <div
                        key={`g-${section.id}-${unit.figures[0].i}`}
                        data-figure-grid=""
                        className="!my-10 grid grid-cols-1 items-start gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
                      >
                        {unit.figures.map(({ media, i }) => (
                          <ChapterFigure
                            key={`f-${section.id}-${i}`}
                            media={media}
                            deviceFrame={deviceFrame}
                            inGrid
                          />
                        ))}
                      </div>
                    ),
                  )
                : imageLayout === "editorial"
                  ? groupEditorialUnits(section.blocks).flatMap((unit) => {
                      if (unit.kind === "block")
                        return [renderBlock(section, unit.block, unit.i, deviceFrame)];
                      if (!unit.beside) {
                        /*
                         * WIDE (or narrow with nothing to sit beside): prose,
                         * then the figure with its caption under it — exactly
                         * the stacked render, item for item, so the spacing is
                         * the stacked spacing.
                         */
                        return [
                          ...unit.prose.map((p) => renderBlock(section, p.block, p.i, deviceFrame)),
                          <ChapterFigure
                            key={`f-${section.id}-${unit.i}`}
                            media={unit.media}
                            deviceFrame={deviceFrame}
                          />,
                        ];
                      }
                      const side: EditorialSide = besideCount++ % 2 === 0 ? "start" : "end";
                      return [
                        /*
                         * NARROW: one grid per pair.
                         *
                         * Below `md` it is one column in DOM order — prose,
                         * then the figure (image, then its caption) — with the
                         * container's own 24px rhythm (`gap-y-6`), which is
                         * what stacked gives.
                         *
                         * From `md`: two equal columns (`grid-cols-2` =
                         * minmax(0,1fr) each) with a 40px gutter. Equal, not
                         * 5/7: inside the 1000px prose container a 7/12 track
                         * makes a square mockup ~530px and it outweighs the
                         * text; at 1/1 it is ~456px, level with the prose.
                         *
                         * Four rows, `1fr auto auto 1fr`: prose in row 2,
                         * caption in row 3, figure across all four. The two
                         * `1fr` rows absorb the difference in height, so the
                         * text group and the figure are BOTH vertically
                         * centred on each other whichever is taller.
                         *
                         * The figure element goes `md:contents` (see
                         * `ChapterFigure`) so its image and its <figcaption>
                         * become cells of THIS grid and the caption can sit in
                         * the text column while staying inside its <figure>.
                         *
                         * SIDES ARE GRID COLUMNS, NOT PHYSICAL SIDES. Column 1
                         * is the inline start, because grid placement follows
                         * `direction` — so in Arabic column 1 is on the right
                         * and the whole row mirrors without this file knowing
                         * the locale.
                         *
                         * `md:!my-10`: the same 40px a framed figure takes, and
                         * the `!` for the same reason (learn.md Part 5,
                         * `space-y-*` outranks `mt-*`). Below `md` the pair
                         * keeps the container's 24px, as stacked does.
                         */
                        <div
                          key={`e-${section.id}-${unit.i}`}
                          data-editorial={side}
                          className="grid grid-cols-1 gap-y-6 md:!my-10 md:grid-cols-2 md:grid-rows-[1fr_auto_auto_1fr] md:gap-x-10 md:gap-y-0"
                        >
                          {unit.prose.length > 0 ? (
                            <div
                              className={`min-w-0 space-y-6 md:row-start-2 ${
                                /*
                                  The 12px between prose and caption, owned by
                                  the prose so a caption-only column carries no
                                  stray margin (see the editorial figcaption).
                                  Only when there IS a caption, or prose with
                                  none would sit 6px above centre.
                                */
                                unit.media.fields.caption ? "md:pb-3" : ""
                              } ${
                                side === "end" ? "md:col-start-1" : "md:col-start-2"
                              }`}
                            >
                              {unit.prose.map((p) => renderBlock(section, p.block, p.i, deviceFrame))}
                            </div>
                          ) : null}
                          <ChapterFigure
                            media={unit.media}
                            deviceFrame={deviceFrame}
                            editorialSide={side}
                            captionAsParagraph={unit.prose.length === 0}
                          />
                        </div>,
                      ];
                    })
                  : section.blocks.map((block, i) => renderBlock(section, block, i, deviceFrame))}
            </div>
          </section>
        );
      })}
    </>
  );
}

/**
 * One block of a section — prose, figure or table — exactly as the stacked
 * layout has always rendered it. Lifted out of the map unchanged so the grid
 * path can render the blocks between its runs with the same code rather than
 * a copy of it.
 */
function renderBlock(
  section: ChapterSection,
  block: ChapterSection["blocks"][number],
  i: number,
  deviceFrame: DeviceFrameKind,
) {
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
        deviceFrame={deviceFrame}
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
  deviceFrame,
  inGrid = false,
  editorialSide,
  captionAsParagraph = false,
}: {
  media: Media | null;
  deviceFrame: DeviceFrameKind;
  /*
   * Set only by the editorial path, for a NARROW figure placed beside its
   * prose. The <figure> becomes `display: contents` from `md`, so its image
   * box and its <figcaption> are placed as cells of the pair's grid: the image
   * in the figure column, the caption in the text column under the prose.
   * Below `md` the figure is an ordinary block — image, then caption.
   *
   * "end" puts the figure in column 2 (inline end), "start" in column 1.
   */
  editorialSide?: EditorialSide;
  /*
   * Editorial beside rows only, and only when the text column holds the
   * caption alone (no prose before the figure). The caption is then the
   * row's only text, so it takes the PROSE paragraph's type — `text-body`,
   * its 1.7 leading, no measure cap, `whitespace-pre-line` — in the caption's
   * muted colour. It stays a <figcaption>: it is still this figure's caption,
   * only its presentation changes. With prose beside it, it stays the small
   * caption under the prose. Task `012261026`.
   */
  captionAsParagraph?: boolean;
  /*
   * Set only by the grid path. The grid owns the spacing (its own margin and
   * gap), so the figure drops its margins; and a framed figure fills its cell
   * up to the frame's cap and centres there instead of hugging the start.
   * `w-full` is what makes `mx-auto` safe: an auto-margined grid item with no
   * width shrinks to fit-content, and the frame inside is `w-full`, which is
   * the circular percentage that collapsed `w-fit` to zero (see below).
   */
  inGrid?: boolean;
}) {
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
  const editorial = editorialSide !== undefined;
  /*
   * Literal class strings, one per side, so Tailwind's scanner sees each one.
   * The text column is always the other one.
   */
  const figureCol = editorialSide === "end" ? "md:col-start-2" : "md:col-start-1";
  const textCol = editorialSide === "end" ? "md:col-start-1" : "md:col-start-2";

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

      The parent is `<div className="mt-5 space-y-6">` (in `ChapterSections`). `space-y-6`
      compiles to `.space-y-6 > :not([hidden]) ~ :not([hidden])`, which outranks
      a bare `.mt-8` on the child, so EVERY figure on every chapter has been
      spaced at the container's 24px since it was written — the `mt-8` here was
      dead the whole time, and so were the `mt-14` and `mb-14` that replaced it
      earlier in this same task. `space-y` also forces `margin-bottom: 0`, which
      is why the bottom margin never did anything either.

      Measured, not reasoned: `mt-22` resolves to 88px on a bare element and to
      24px on this figure. That gap between the two readings is the bug.

      The same conflict is already documented for the table in `renderBlock`, where
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
      className={
        editorial
          ? /*
             * No margins: the pair's grid owns the spacing. `md:contents`
             * dissolves the box so its two children become grid cells; a
             * `style` on a `contents` box applies to nothing, which is why the
             * frame's width cap moves to the image cell below.
             */
            "min-w-0 md:contents"
          : inGrid
          ? device
            ? "relative mx-auto w-full min-w-0"
            : "min-w-0"
          : device
            ? "relative !mt-10 !mb-10"
            : "mt-8"
      }
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
      style={
        device && !editorial ? { maxWidth: phone ? PHONE_FRAME_MAX_W : LAPTOP_FRAME_MAX_W } : undefined
      }
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
                : editorial
                  ? /*
                     * Centred in its column rather than hugging the start: a
                     * portrait that hits the height cap is narrower than the
                     * column, and on the inline-end side a start-hugging image
                     * would leave its gap between itself and the prose.
                     */
                    "mx-auto block h-auto w-full max-w-full md:max-h-figure md:w-auto"
                  : "me-auto block h-auto w-full max-w-full md:max-h-figure md:w-auto"
            }
          />
        );
        const visual = phone ? (
          <PhoneFrame variant={deviceFrame === "android" ? "android" : "default"}>{img}</PhoneFrame>
        ) : laptop ? (
          <DeviceFrame>{img}</DeviceFrame>
        ) : (
          img
        );
        if (!editorial) return visual;
        /*
         * The image cell: rows 1 to 5 (all four tracks), centred vertically.
         * A framed picture carries the frame's own width cap here, with
         * `w-full mx-auto` — the same pairing the grid path uses, for the
         * same reason (an auto-margined item with no width shrinks to
         * fit-content, and the `w-full` frame inside collapses with it).
         */
        return (
          <div
            className={`min-w-0 md:row-start-1 md:row-end-5 md:self-center ${figureCol} ${
              device ? "mx-auto w-full" : ""
            }`}
            style={device ? { maxWidth: phone ? PHONE_FRAME_MAX_W : LAPTOP_FRAME_MAX_W } : undefined}
          >
            {visual}
          </div>
        );
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

              POSITION. THE CHIP FLOATS ON A LAPTOP AND NEVER ON A PHONE.

              ⚠️ TWO SEPARATE REASONS, AND THEY ARE NOT THE SAME REASON.

              1. NARROW VIEWPORTS. A chip covering a tenth of a 1440px
                 screenshot covers about a third of a 390px one, and what it
                 covers is the picture the caption exists to describe. So below
                 `md` nothing floats. Written mobile-first — static is the base
                 and `md:` adds the float — because the phone is where the harm
                 was.

              2. THE PHONE FRAME, AT ANY WIDTH. A laptop's bottom edge is a
                 straight run of bezel and a chip sitting on it hides nothing.
                 A phone's is a deep rounded chin, and the same chip covers the
                 corner curve — the part that makes the object read as a phone
                 at all. So a phone-framed figure keeps the static caption even
                 on a wide screen: the whole frame stays visible, which is what
                 it is drawn for.

              Where it does float: `inset-x-0` + `mx-auto` + `w-fit` centres it
              without naming a physical side, so LTR and RTL are identical —
              `left-1/2` with a negative translate would have been a direction
              trap. `bottom-0 translate-y-1/2` puts its centre on the bottom
              line.

              `md:mt-0` is not tidiness: the static caption's `mt-3` would
              otherwise still be in the box once it goes absolute, pushing it
              off the line it is supposed to sit on.

              Off-scale spacing does not exist here — the scale is REPLACED, not
              extended, so `py-1.5` would compile to nothing and the chip would
              silently lose its padding.

              Unframed captions are unchanged. This belongs to the device
              treatment, live on one chapter while its look is being agreed.
            */
            /*
              EDITORIAL: the caption is a cell of the pair's grid — row 3, the
              text column, directly under the prose. Never floating: it is not
              on a frame's edge any more, it is under a paragraph.

              FRAMED OR NOT, IT IS THE PLAIN CAPTION (task `012261026`). The
              chip exists because it sits ON a frame; in the text column it
              sits under prose, and a mono chip there reads as a label beside
              a paragraph rather than as the caption it is. Every caption in
              the column is the unframed style, so `device` is deliberately
              not consulted on this branch. Stacked and grid keep the chip.
            */
            editorial
              ? [
                  /*
                    `md:mt-0`: from `md` the 12px above the caption is the
                    prose column's `md:pb-3`, not this margin. As a margin it
                    stayed in row 3 when there was no prose, and the centred
                    text group was caption + 12px, so a caption-only column
                    sat 6px below the image's centre. Below `md` the caption
                    is under its image again and keeps `mt-3`.
                  */
                  captionAsParagraph
                    ? /*
                        Caption-only column: the first row's paragraph type
                        (see `renderBlock`'s <p>), muted. No measure cap, as
                        the paragraph has none. No box, no background.
                      */
                      "mt-3 whitespace-pre-line text-body text-fg-muted md:mt-0"
                    : "mt-3 max-w-measure text-meta text-fg-muted md:mt-0",
                  "md:row-start-3 md:self-start",
                  textCol,
                ].join(" ")
              : device
              ? [
                  "mx-auto mt-3 w-fit max-w-measure rounded-control border border-DEFAULT bg-surface px-3 py-1 text-center font-mono text-micro text-fg-dim",
                  phone
                    ? ""
                    : "md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:translate-y-1/2",
                ]
                  .join(" ")
                  .trim()
              : "mt-3 max-w-measure text-meta text-fg-muted"
          }
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
