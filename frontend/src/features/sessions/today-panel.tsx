import Link from "next/link";
import type { Category } from "@/features/categories/queries";
import { KindMark } from "@/features/categories/kind-mark";
import type { Project } from "@/features/projects/queries";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { DayStrip } from "./day-strip";
import { formatDuration, sessionSeconds } from "./duration";
import { dayBlocks, executionSeconds } from "./history";
import { KindTotals } from "./kind-totals";
import type { SessionSpan } from "./queries";

/** Today's finished sessions beside the timer, newest first. */
export function TodayPanel({
  spans,
  categories,
  projects,
  timeZone,
}: {
  spans: SessionSpan[];
  categories: Category[];
  projects: Project[];
  timeZone: string;
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const total = spans.reduce((sum, span) => sum + sessionSeconds(span), 0);
  const execution = executionSeconds(spans, categoryById);
  const newestFirst = spans.toSorted((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  return (
    <section aria-labelledby="today-heading" className="flex flex-col gap-4">
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
      {spans.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing finished yet today.
        </p>
      ) : (
        <>
          <KindTotals execution={execution} preparation={total - execution} />
          <ul className="flex flex-col divide-y border-t">
            {newestFirst.map((span) => {
              // A category with sessions cannot be removed.
              const category = categoryById.get(span.categoryId)!;
              return (
                <li key={span.id}>
                  <Link
                    href={`/sessions/${span.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {formatLocalTime(new Date(span.startedAt), timeZone)}
                    </span>
                    <KindMark kind={category.kind} />
                    <span className="sr-only">{category.name}:</span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {projectName.get(span.projectId)}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatDuration(sessionSeconds(span))}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
