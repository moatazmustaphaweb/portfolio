import { CloudinaryImage } from "@/components/media/CloudinaryImage";
import { dirForLocale } from "@/lib/content/types";
import type { CoverSection, Locale } from "@/lib/content/types";

/**
 * A cover's slots, rendered in the order the database holds them.
 *
 * ── WHAT CHANGED, AND WHY IT MATTERS ────────────────────────────────────────
 *
 * This replaces three hardcoded blocks — thesis, role, reflection — each keyed
 * to a fixed field and rendered in a fixed place. That composition could only
 * express one cover shape, and the four covers are deliberately different:
 * Cervello opens with a description and has no thesis; Neobiz states its role
 * inside its thesis and has no role section; UAE calls its chapter list "What's
 * in it" where Egypt calls it "The map".
 *
 * Now: which slots exist, what each is headed, and what order they come in are
 * all read from the database. **An absent slot renders nothing.** No default
 * heading is invented and no empty slot is shown.
 *
 * ── PARAGRAPHS ──────────────────────────────────────────────────────────────
 *
 * Each paragraph is its own row and its own <p>. The previous render put a
 * joined string into a single <p> with no `whitespace-pre-line`, so Egypt's
 * five paragraphs arrived as one unbroken run of text. That is not fixed here
 * so much as made impossible: there is no separator left to lose.
 *
 * ── SIZING (decision: --text-lead is not for 1,085 characters) ───────────────
 *
 * The opening passage used `--text-lead` — clamp(20px, 3vw, 28px)/1.3, which is
 * correct for a one-sentence lede and is how every other page uses it. On the
 * Egypt cover it was applied to five paragraphs, and the passage dominated the
 * page. Prose is `--text-body` here; section headings take `--text-label`.
 *
 * The consequence is deliberate and was approved: the ROLE CARD becomes the
 * loudest element on the cover. The brief's seniority argument rests on the
 * role statement being prominent, and it now is.
 */

/** Slots that get the bordered card the design gives a reflective passage. */
const CARD_SLOTS = new Set(["status", "why-it-matters"]);

/**
 * Split a cover's slots into the pair that shares the two-column container and
 * the rest that stay full width beneath it.
 *
 * The lead is **the leading run of sections up to and including `role`**, not
 * literally `thesis` + `role`. That distinction is load-bearing on Cervello,
 * whose slots are `what-it-is(0) · role(1) · status(2) · why-it-matters(3)`:
 * selecting `thesis`+`role` by NAME would put its opening passage BELOW its
 * role card and silently reverse the reading order of the page. The leading run
 * preserves order on every cover:
 *
 *   Egypt · UAE   [thesis, role]        → map below
 *   Cervello      [what-it-is, role]    → status, why-it-matters below
 *   Neobiz        [thesis]  (no role)   → what-it-is, status, why-it-matters below
 *
 * A cover with neither slot yields an empty lead and renders everything below,
 * which is the correct degenerate case rather than a special one.
 */
export function splitCoverSections(sections: CoverSection[]): {
  lead: CoverSection[];
  rest: CoverSection[];
} {
  const roleAt = sections.findIndex((s) => s.slot === "role");
  /*
   * ROLE IS NO LONGER PART OF THE LEAD. The run ends BEFORE it, so the role
   * card falls into `rest` and renders full width beneath the container
   * instead of inside its two-thirds column with dead space beside it.
   *
   * Document order is untouched: `rest` renders immediately after `lead`, so
   * `sections.slice(0, roleAt)` followed by `sections.slice(roleAt)` is the
   * same sequence it always was.
   *
   * The three covers with no lead image are unaffected by construction — the
   * container only becomes a grid when `sideImage` exists, and it is null on
   * all three. Neobiz has no `role` slot at all, so `roleAt` is -1 and the
   * fallback below is the same one it has always taken.
   */
  const end = roleAt >= 0 ? roleAt : sections.length > 0 ? 1 : 0;
  return { lead: sections.slice(0, end), rest: sections.slice(end) };
}

export function CoverSections({
  sections,
  roleLabel,
}: {
  sections: CoverSection[];
  /** `ui_strings.role_label`. Absent means the label is simply not drawn. */
  roleLabel?: string;
}) {
  // A slot with no paragraphs in this locale contributes nothing to read, so it
  // is not drawn as an empty heading. The sync reports it separately as an
  // authoring mistake; the page just declines to show a gap.
  const usable = sections.filter((s) => s.paragraphs.length > 0);
  if (usable.length === 0) return null;

  return (
    <>
      {usable.map((section) => {
        /*
         * THE ROLE CARD. The accent spine is `w-1` (4px) — a graphic element,
         * not a border, so it is exempt from the one-stroke-weight rule the way
         * the design treats it.
         *
         * The first paragraph is the role STATEMENT and takes `--text-statement`;
         * any paragraphs after it are supporting detail at body size. Egypt's
         * role section runs to three paragraphs, and setting all three at
         * statement size would shout the detail as loudly as the claim.
         */
        if (section.slot === "role") {
          const [statement, ...rest] = section.paragraphs;
          return (
            <section
              key={section.id}
              /*
               * FULL WIDTH, BOX AND TEXT. The card was `max-w-measure-lead`
               * (42ch) and sat inside the two-thirds column with the lead image
               * beside it, leaving a band of dead space to its side.
               *
               * The measure cap on the inner column was tried and removed:
               * a full-width box around a 718px column read as a wide box with
               * an empty right half, which is the thing the change was made to
               * fix. Seen on screen and called; the readability trade is
               * accepted deliberately, not overlooked.
               */
              className="mt-10 flex items-stretch overflow-hidden rounded-panel border border-strong bg-surface"
            >
              <div aria-hidden="true" className="w-1 shrink-0 bg-accent" />
              <div className="flex flex-col gap-3 p-card-p">
                {/*
                  The mono label is the section's own heading when it has one —
                  "My role", "دوري" — falling back to the ui_strings label. The
                  heading a cover wrote is content and outranks a generic label.
                */}
                {section.heading || roleLabel ? (
                  <span className="font-mono text-section uppercase text-fg-dim">
                    {section.heading ?? roleLabel}
                  </span>
                ) : null}
                <p className="text-statement text-fg">{statement}</p>
                {rest.map((p, i) => (
                  <p key={i} className="text-body text-fg-body">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          );
        }

        if (CARD_SLOTS.has(section.slot)) {
          return (
            <section
              key={section.id}
              className="mt-14 max-w-measure-lead rounded-panel border border-DEFAULT bg-surface p-card-p"
            >
              {section.heading ? (
                <h2>
                  <span className="font-mono text-section uppercase text-fg-dim">
                    {section.heading}
                  </span>
                </h2>
              ) : null}
              <div className="mt-4 flex flex-col gap-4">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-body text-fg-body">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          );
        }

        /*
         * thesis · what-it-is · map — plain prose under its own heading.
         *
         * ── SIZE: `--text-label` ON A SPAN INSIDE THE H2 ────────────────────
         *
         * These were `--text-h3`, which renders at its clamp maximum of 28px/600
         * — the same weight class as a page-level heading, sitting directly
         * beneath a 60px H1. They are labels above prose, and 28px made "Thesis"
         * compete with the case file's own title.
         *
         * The label lives on a SPAN inside the heading, and that is not
         * decoration. `:lang(ar) h2` forces `font-weight: 400` with
         * `font-synthesis-weight: none`, because LANTX ships one weight and a
         * faked 600 smears Arabic joins closed — so in Arabic an h2 has NO
         * weight axis and its hierarchy is size alone. Every token below
         * `--text-h3` then fails there: at `--text-ui` the heading measures
         * 16.1px against 18.4px body text, smaller AND no heavier than the prose
         * it introduces. Measured, not reasoned.
         *
         * The span escapes that rule: it is not a heading element, so it keeps
         * weight 500 and takes the Arabic BODY face (Meral, which ships four
         * weights) rather than the display face. In Arabic it renders 14.3px/500
         * — byte-identical to the `MY ROLE` label two sections up, which has
         * always read correctly. `--type-scale-small` (1.30) is what lifts 11px
         * to 14.3px, which is what that factor exists for.
         *
         * THE HEADING LEVEL IS UNCHANGED. Still an `<h2>` — size is a token,
         * heading level is document structure, and the outline a screen reader
         * announces must not move because a visual weight did.
         *
         * ⚠️ The trade-off, flagged rather than buried: `uppercase` flattens
         * "Status, honestly" to "STATUS, HONESTLY" in ENGLISH, and that comma is
         * doing work. Arabic is unaffected — it has no case. See docs/status.md.
         */
        /*
         * ── THE IMAGE COLUMN, PER SECTION (migration 0041) ─────────────────
         *
         * An image belongs to a SECTION, not to a case file. A section that
         * has one renders its text at two thirds with the image at one third;
         * a section without renders full width, byte-identical to how every
         * section rendered before this existed.
         *
         * The container used to live on the page and activate once, on the
         * leading run, which is why the `map` section had unaddressable space
         * beside it. It activates per section now.
         *
         * Logical by construction: CSS Grid places items along the INLINE
         * axis, so under `dir="rtl"` the text column lands on the right and
         * the image on the left, with no direction check anywhere.
         */
        const body = (
          <>
            {section.heading ? (
              <h2 className="mb-3">
                <span className="font-mono text-section uppercase text-fg-dim">
                  {section.heading}
                </span>
              </h2>
            ) : null}
            <div className="flex max-w-measure flex-col gap-4">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-body text-fg-body">
                  {p}
                </p>
              ))}
            </div>
          </>
        );

        if (!section.media) {
          return (
            <section key={section.id} className="mt-10">
              {body}
            </section>
          );
        }

        return (
          <section key={section.id} className="mt-10 grid items-start gap-x-10 lg:grid-cols-3">
            <div className="lg:col-span-2">{body}</div>
            <SectionImage media={section.media} />
          </section>
        );
      })}
    </>
  );
}

/**
 * One section's image: the third column.
 *
 * `preset="lead"` — 600 at `limit`, `sizes` fixed at 400px above `lg`. It never
 * crops, so a portrait keeps its height and a landscape keeps its width, and
 * the two images on the Egypt cover are deliberately different shapes.
 *
 * A caption is optional and most section images will not have one. It is marked
 * from its OWN language (decision 053): alt and caption fall back to English on
 * `/ar`, and unmarked English inside a `dir="rtl"` document puts its full stop
 * at the start of the line.
 */
function SectionImage({ media }: { media: NonNullable<CoverSection["media"]> }) {
  const caption = media.fields.caption;
  const captionLang: Locale | undefined = media.fieldLocales.caption;

  return (
    <figure className="mt-10 lg:mt-0">
      <CloudinaryImage
        media={media}
        preset="lead"
        className="h-auto w-full rounded-panel border border-DEFAULT"
      />
      {caption ? (
        <figcaption
          lang={captionLang}
          dir={captionLang ? dirForLocale(captionLang) : undefined}
          className="mt-3 text-meta text-fg-muted"
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
