import type { PageSection } from "@/lib/content/types";

/**
 * Ordered prose sections for a static page.
 *
 * All four static pages are the same shape — a lede, then headed sections —
 * so they share this rather than each re-deciding what a section looks like.
 * The pages differ in what they add AROUND it (links into case files, a form,
 * contact methods), which is where their differences actually are.
 *
 * `whitespace-pre-line` renders the paragraph breaks the sync stored as blank
 * lines. A section is one string with `\n\n` between paragraphs, so the shape
 * of the writing survives the round trip without needing a rich-text model.
 */
export function ProseSections({
  intro,
  sections,
}: {
  intro?: string;
  sections: PageSection[];
}) {
  return (
    <>
      {/*
        The lede is typeset larger and carries no heading — it is the opening
        of the page, not its first topic.
      */}
      {intro ? (
        <p className="mt-6 max-w-measure whitespace-pre-line text-lead text-fg-body">
          {intro}
        </p>
      ) : null}

      {sections.map((section) =>
        section.fields.body ? (
          <section key={section.id} className="mt-14">
            {section.fields.heading ? (
              <h2 className="mb-4 max-w-measure text-h3 text-fg">
                {section.fields.heading}
              </h2>
            ) : null}
            <p className="max-w-measure whitespace-pre-line text-body text-fg-body">
              {section.fields.body}
            </p>
          </section>
        ) : null,
      )}
    </>
  );
}
