import { CloudinaryImage } from "@/components/media/CloudinaryImage";
import { SectionTable } from "@/components/layout/ProseSections";
import { dirForLocale } from "@/lib/content/types";
import type { ChapterBlock, ChapterSection, Locale, Media } from "@/lib/content/types";

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
 * is unreachable rather than merely avoided. Pairing them into one grid ROW,
 * below, does not change this — the two are still siblings inside that row,
 * neither nested in the other.
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
 *
 * ── A PARAGRAPH PAIRS WITH THE IMAGE IMMEDIATELY AFTER IT (task `036240826`) ─
 *
 * Added 2026-08-24, on Moataz's explicit instruction, extending the rule
 * `CoverSections` already carries: a paragraph with an image beside it renders
 * at two thirds with the image at one third; a paragraph with nothing beside
 * it goes full width. Chapters render as a flat, ordered sequence of prose,
 * image and table blocks — not a section with one optional image the way a
 * cover slot is — so "beside it" has to be a positional rule, walked once:
 *
 *   prose, then an image immediately next  → paired: text 2/3, image 1/3
 *   prose with anything else (or nothing) next → full width, alone
 *   an image not consumed by the prose before it → full width, alone
 *   a table → unchanged, always its own full-width row
 *
 * Checked against real data before writing this, not assumed: Egypt's
 * `onboarding/what-i-designed` section runs prose, prose, IMAGE, IMAGE, prose,
 * prose, IMAGE, prose, IMAGE, prose, IMAGE, IMAGE, IMAGE, IMAGE — no clean
 * one-paragraph-one-image alternation, and runs of up to four consecutive
 * images exist. The rule above is deliberately POSITIONAL rather than trying
 * to guess which image a paragraph is "about": simple, deterministic, and it
 * matches what Moataz confirmed rather than what would need inferring from
 * the prose itself.
 *
 * `groupBlocks` does this walk once, before any rendering. Kept as its own
 * function (and exported) so it can be tested against the shape above without
 * rendering anything.
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

        const rows = groupBlocks(section.blocks);
        if (rows.length === 0) return null;

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
              {rows.map((row, i) => {
                const key = `${section.id}-${i}`;

                if (row.type === "pair") {
                  return (
                    <div
                      key={key}
                      /*
                       * Same shape as `CoverSections`' per-section grid, and for
                       * the same reason: CSS Grid places items along the INLINE
                       * axis, so it mirrors under `dir="rtl"` with no direction
                       * check written anywhere.
                       */
                      className="grid items-start gap-x-10 lg:grid-cols-3"
                    >
                      <p
                        lang={row.text.lang}
                        dir={dirForLocale(row.text.lang)}
                        className="max-w-measure whitespace-pre-line text-body text-fg-body lg:col-span-2"
                      >
                        {row.text.text}
                      </p>
                      <ChapterFigure media={row.image.media} variant="paired" />
                    </div>
                  );
                }

                if (row.type === "text") {
                  /*
                   * No `max-w-measure` — nothing sits beside this paragraph, so
                   * a reading-width cap here is the exact bug `033240826` and
                   * `034240826` fixed on `CoverSections`, just moved one file
                   * over. It fills whatever the page's own container already
                   * is (`max-w-prose` or `max-w-container` — untouched, and not
                   * this file's concern).
                   */
                  return (
                    <p
                      key={key}
                      lang={row.block.lang}
                      dir={dirForLocale(row.block.lang)}
                      className="whitespace-pre-line text-body text-fg-body"
                    >
                      {row.block.text}
                    </p>
                  );
                }

                if (row.type === "image") {
                  return <ChapterFigure key={key} media={row.block.media} variant="solo" />;
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
                    key={key}
                    lang={row.block.lang}
                    dir={dirForLocale(row.block.lang)}
                    /*
                     * `display: contents` — the wrapper carries the language and
                     * then gets out of the way. A real box here would take the
                     * parent's `space-y-6` margin while the table kept its own
                     * `mt-10`, quietly doubling the gap above every table.
                     * `direction` and `lang` still inherit through it.
                     */
                    className="contents"
                  >
                    <SectionTable body={row.block.body} />
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

type ProseBlock = Extract<ChapterBlock, { kind: "prose" }>;
type ImageBlock = Extract<ChapterBlock, { kind: "image" }>;
type TableBlock = Extract<ChapterBlock, { kind: "table" }>;

type Row =
  | { type: "pair"; text: ProseBlock; image: ImageBlock }
  | { type: "text"; block: ProseBlock }
  | { type: "image"; block: ImageBlock }
  | { type: "table"; block: TableBlock };

/**
 * Walks a section's blocks once and decides which paragraphs pair with an
 * image immediately after them. See the component comment for the rule and
 * why it is positional.
 *
 * An `image` block whose `media` resolved to `null` — a deleted row, or a
 * locale with no alt (`lib/content/types.ts`) — is dropped BEFORE the walk,
 * not after. `ChapterFigure` already renders nothing for it; leaving it in
 * the sequence would either pair a paragraph with an empty column or count as
 * "something beside it" for a paragraph that, visually, has nothing there.
 */
export function groupBlocks(blocks: ChapterBlock[]): Row[] {
  const usable = blocks.filter((b) => b.kind !== "image" || b.media !== null);
  const rows: Row[] = [];
  let i = 0;

  while (i < usable.length) {
    const block = usable[i];

    if (block.kind === "prose") {
      const next = usable[i + 1];
      if (next && next.kind === "image") {
        rows.push({ type: "pair", text: block, image: next });
        i += 2;
        continue;
      }
      rows.push({ type: "text", block });
      i += 1;
      continue;
    }

    if (block.kind === "image") {
      rows.push({ type: "image", block });
      i += 1;
      continue;
    }

    rows.push({ type: "table", block });
    i += 1;
  }

  return rows;
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
 *
 * ── TWO SIZINGS, ONE FOR EACH CONTEXT ────────────────────────────────────────
 *
 * `variant="solo"` — an image with no adjacent paragraph, full width of the
 * section. Below `md` it takes the full column at its own aspect ratio. From
 * `md` up the HEIGHT is capped at `--figure-max-h` and the width becomes
 * `auto`, so a square mockup stops being a thousand-pixel wall between two
 * paragraphs. Unchanged from before `036240826` — nothing about a solo image
 * changed.
 *
 * `variant="paired"` — added `036240826`, sits in the one-third grid column
 * beside its paragraph. No height cap: the column is already narrow (roughly
 * a third of the section, well under the point `--figure-max-h` would ever
 * bind at), so the cap built for a full-width image has nothing to do here.
 * Fills its column at its own aspect ratio instead, the same rule
 * `CoverSections`' `SectionImage` already uses for its one-third column.
 *
 * `me-auto` on the solo variant, not `mr-auto`: once the image is narrower
 * than its column it has to hug the inline start, which is the left in
 * English and the right in Arabic. `block` is what makes that margin apply at
 * all — an inline image would take its position from the ancestor's
 * `text-align` instead. The paired variant fills its column exactly, so it
 * has no narrower-than-container case to hug a side from.
 */
function ChapterFigure({
  media,
  variant,
}: {
  media: Media | null;
  variant: "solo" | "paired";
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
    <figure className={variant === "solo" ? "mt-8" : "mt-10 lg:mt-0"}>
      <CloudinaryImage
        media={media}
        preset={variant === "solo" ? "gallery" : "lead"}
        className={
          variant === "solo"
            ? "me-auto block h-auto w-full max-w-full md:max-h-figure md:w-auto"
            : "h-auto w-full"
        }
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
