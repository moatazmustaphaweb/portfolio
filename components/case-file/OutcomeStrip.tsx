import type { Outcome } from "@/lib/content/types";

/**
 * The outcome strip.
 *
 * Every figure carries its status. That is not decoration and it is not
 * optional: a number shown without its `Projected` / `Achieved` label is the
 * exact misrepresentation decision 007 exists to prevent, and this strip is
 * the most quotable thing on the page.
 *
 * Where a case file has NO outcomes, this renders nothing and the page says so
 * in prose instead. An honest absence reads as senior; a manufactured metric
 * reads as the opposite, and the component must never be tempted to fill a gap.
 */
export function OutcomeStrip({
  outcomes,
  statusLabels,
}: {
  outcomes: Outcome[];
  /** Resolved `ui_strings` labels, keyed by `outcome_status`. */
  statusLabels: Record<string, string | undefined>;
}) {
  const usable = outcomes.filter((o) => o.fields.label ?? o.value);
  if (usable.length === 0) return null;

  return (
    <ul className="grid gap-px overflow-hidden rounded-panel border border-DEFAULT bg-border sm:grid-cols-2 lg:grid-cols-3">
      {usable.map((outcome) => (
        <li key={outcome.id} className="flex flex-col gap-2 bg-surface p-card-p">
          {/*
            `text-statement`, not `text-metric`. The design draws this grid for
            short values — "30%", "10k+", "14 → 6" — and sets them at 28–38px.
            The real outcomes are sentences: "Live in production for over a
            year and a half". At metric size those wrap to four lines each and
            the grid stops being scannable, which is the only thing a metric
            grid is for. The container is the design's; the type is sized for
            the content that actually goes in it.
          */}
          <span className="text-statement text-fg">
            {outcome.fields.label ?? outcome.value}
          </span>

          {statusLabels[outcome.status] ? (
            <span className="font-mono text-micro uppercase text-fg-dim">
              {statusLabels[outcome.status]}
            </span>
          ) : null}

          {/*
            The note is how the figure is known — prototype evidence, an agreed
            SLA, a business projection. It is what makes the marker defensible
            rather than a label, so it is shown, not tucked away.
          */}
          {outcome.fields.note ? (
            <span className="text-meta text-fg-muted">{outcome.fields.note}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
