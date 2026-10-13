import type { Category } from "@/features/categories/queries";
import { DayStrip } from "./day-strip";
import { formatDuration, sessionSeconds } from "./duration";
import { dayBlocks, executionSeconds } from "./history";
import { KindTotals } from "./kind-totals";
import type { SessionSpan } from "./queries";

/** Today's finished sessions, shown above the start controls. */
export function TodayStrip({
  spans,
  categories,
  timeZone,
}: {
  spans: SessionSpan[];
  categories: Category[];
  timeZone: string;
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const total = spans.reduce((sum, span) => sum + sessionSeconds(span), 0);
  const execution = executionSeconds(spans, categoryById);

  return (
    <section aria-labelledby="today-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="today-heading" className="text-lg font-semibold tracking-tight">
          Today
        </h2>
        <div className="flex items-center gap-3">
          <DayStrip blocks={dayBlocks(spans, categoryById, timeZone)} />
          <span className="text-lg font-semibold tabular-nums">
            {formatDuration(total)}
          </span>
        </div>
      </div>
      <KindTotals execution={execution} preparation={total - execution} />
    </section>
  );
}
