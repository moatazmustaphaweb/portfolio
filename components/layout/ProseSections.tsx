import type { PageSection } from "@/lib/content/types";

/**
 * Ordered prose sections for a static or document page.
 *
 * `variant` selects the composition:
 *
 *  - `plain` — every section at equal weight. About, Systems, Contact.
 *  - `comparison` — from `Comparison.dc.html`: the first headed section
 *    becomes an accent-bordered **governing rule** card, and the last becomes
 *    a closing statement. Both comparison pages open by stating the rule that
 *    makes the table legible ("Regulation is identical on both platforms…",
 *    "The portal's architecture was settled on the web…"), and the design is
 *    right that it should not look like another paragraph.
 *
 * The rule is positional, not keyed to any heading text, so it survives a
 * rewrite in Notion.
 */
export function ProseSections({
  intro,
  sections,
  variant = "plain",
}: {
  intro?: string;
  sections: PageSection[];
  variant?: "plain" | "comparison" | "accessibility";
}) {
  const usable = sections.filter((s) => s.fields.body);
  const prose = usable.filter((s) => s.kind !== "table");

  const ruleId = variant === "comparison" ? prose[0]?.id : undefined;
  const closeId =
    variant === "comparison" && prose.length > 1
      ? prose[prose.length - 1]?.id
      : undefined;

  return (
    <>
      {intro ? (
        <p className="mt-6 max-w-measure whitespace-pre-line text-lead text-fg-body">
          {intro}
        </p>
      ) : null}

      {usable.map((section) => {
        if (section.kind === "table") {
          return <SectionTable key={section.id} body={section.fields.body!} />;
        }

        /*
         * Accessibility: numbered sections, the number in its own column and
         * the body indented to align under the heading. Thirteen sections is
         * too many to navigate by scrolling, which is why this page — unlike
         * Philosophy — gets a contents rail beside it.
         */
        if (variant === "accessibility") {
          const n = prose.indexOf(section) + 1;
          return (
            <section
              key={section.id}
              id={section.slug}
              className="scroll-mt-18 border-t border-DEFAULT py-10"
            >
              <div className="flex items-baseline gap-4">
                <span className="min-w-6 font-mono text-micro text-fg-dim">
                  {String(n).padStart(2, "0")}
                </span>
                {section.fields.heading ? (
                  <h2 className="max-w-measure text-h3 text-fg">
                    {section.fields.heading}
                  </h2>
                ) : null}
              </div>
              <p className="mt-4 max-w-measure whitespace-pre-line text-body text-fg-body sm:ps-10">
                {section.fields.body}
              </p>
            </section>
          );
        }

        /* The governing rule — the loudest thing on a comparison page. */
        if (section.id === ruleId) {
          return (
            <section
              key={section.id}
              className="mt-14 rounded-panel border border-accent bg-surface p-card-p"
            >
              {section.fields.heading ? (
                <h2 className="font-mono text-label uppercase text-fg-dim">
                  {section.fields.heading}
                </h2>
              ) : null}
              <p className="mt-5 max-w-measure whitespace-pre-line text-h3 text-fg">
                {section.fields.body}
              </p>
            </section>
          );
        }

        /* The closing line — a statement, not another paragraph. */
        if (section.id === closeId) {
          return (
            <section key={section.id} className="mt-14 border-t border-DEFAULT pt-10">
              {section.fields.heading ? (
                <h2 className="mb-4 font-mono text-label uppercase text-fg-dim">
                  {section.fields.heading}
                </h2>
              ) : null}
              <p className="max-w-measure whitespace-pre-line text-statement text-fg">
                {section.fields.body}
              </p>
            </section>
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
 * A real `<table>` with `scope`, styled as the design's bordered card. The
 * comparison pages exist to be read across a row — a screen reader should be
 * able to say "Capture, web: single upload, mobile: sequential scan" — and a
 * grid of divs looks identical while navigating far worse.
 *
 * Scrolls inside its own container so a five-column table never makes the
 * page scroll sideways.
 */
export function SectionTable({ body }: { body: string }) {
  const rows = body
    .split("\n")
    .map((row) => row.split("\t"))
    .filter((cells) => cells.some((c) => c.trim()));

  if (rows.length === 0) return null;

  const [header, ...rest] = rows;

  return (
    <div className="mt-10 overflow-x-auto rounded-panel border border-DEFAULT bg-surface">
      <table className="w-full border-collapse text-start">
        <thead>
          <tr className="bg-surface-raised">
            {header.map((cell, i) => (
              <th
                key={i}
                scope="col"
                className={`px-5 py-3 text-start font-mono text-micro uppercase text-fg-muted ${
                  i > 0 ? "border-s border-DEFAULT" : ""
                }`}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rest.map((cells, r) => (
            <tr key={r} className="border-t border-DEFAULT align-top">
              {cells.map((cell, c) =>
                c === 0 ? (
                  <th
                    key={c}
                    scope="row"
                    className="px-5 py-5 text-start text-body-sm font-normal text-fg"
                  >
                    {cell}
                  </th>
                ) : (
                  <td
                    key={c}
                    className="border-s border-DEFAULT px-5 py-5 text-body-sm text-fg-muted"
                  >
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
