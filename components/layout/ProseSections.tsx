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

      {sections.map((section) => {
        if (!section.fields.body) return null;

        if (section.kind === "table") {
          return (
            <SectionTable key={section.id} body={section.fields.body} />
          );
        }

        return (
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
        );
      })}
    </>
  );
}

/**
 * A table section: TAB-separated cells, NEWLINE-separated rows, first row the
 * header (migration 0025).
 *
 * A real `<table>` with `scope` attributes, for the same reason the Results
 * Table is one — the comparison pages exist to be read across a row, and a
 * screen reader should be able to say "Capture, web: single upload, mobile:
 * sequential scan". A grid of divs looks identical and navigates far worse.
 *
 * It scrolls inside its own container. These tables are five columns wide and
 * must not make the whole page scroll sideways on a phone.
 */
function SectionTable({ body }: { body: string }) {
  const rows = body
    .split("\n")
    .map((row) => row.split("\t"))
    .filter((cells) => cells.some((c) => c.trim()));

  if (rows.length === 0) return null;

  const [header, ...rest] = rows;

  return (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full border-collapse text-start">
        <thead>
          <tr className="border-b border-strong">
            {header.map((cell, i) => (
              <th
                key={i}
                scope="col"
                className="py-3 pe-6 text-start font-mono text-micro uppercase text-fg-dim"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rest.map((cells, r) => (
            <tr key={r} className="border-b border-DEFAULT align-top">
              {cells.map((cell, c) =>
                /* First cell of each row labels it — a row header, not data. */
                c === 0 ? (
                  <th
                    key={c}
                    scope="row"
                    className="py-5 pe-6 text-start text-body-sm font-normal text-fg"
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="py-5 pe-6 text-body-sm text-fg-muted">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
