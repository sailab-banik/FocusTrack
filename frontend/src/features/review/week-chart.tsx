import { cn } from "cn";
import { KindMark } from "@/features/categories/kind-mark";
import { formatDuration } from "@/features/sessions/duration";
import { percent } from "@/features/work/allocation";
import type { WeekStats } from "./weeks";

const BAR_AREA_PX = 160;
// Chart and table share one grid so each bar sits over its column.
const LABEL_COLUMN = "w-[4.5rem] sm:w-[5.5rem]";
const GRID =
  "grid grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] sm:grid-cols-[5.5rem_repeat(5,minmax(0,1fr))]";

function weekLabel(startKey: string): string {
  // Noon UTC keeps the calendar date stable when formatting as UTC.
  return new Date(`${startKey}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

function compactHours(seconds: number): string {
  return `${(seconds / 3600).toFixed(1)}h`;
}

function share(part: number, whole: number): string {
  return whole === 0 ? "–" : `${percent(part, whole)}%`;
}

/**
 * Five weeks of tracked time, stacked execution under preparation, with the
 * same numbers in a table underneath. The chart is a visual aid only: the
 * table carries every value for screen readers and keyboards.
 */
export function WeekChart({ stats }: { stats: WeekStats[] }) {
  const maxSeconds = Math.max(1, ...stats.map((week) => week.totalSeconds));
  const current = stats.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex gap-5 text-sm text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <KindMark kind="execution" />
          Execution
        </li>
        <li className="flex items-center gap-1.5">
          <KindMark kind="preparation" />
          Preparation
        </li>
      </ul>

      <div aria-hidden className={cn(GRID, "border-b")}>
        <span />
        {stats.map((week) => (
          <WeekColumn
            key={week.startKey}
            week={week}
            heightPx={(week.totalSeconds / maxSeconds) * BAR_AREA_PX}
          />
        ))}
      </div>

      <table className="w-full table-fixed text-xs sm:text-sm">
        <caption className="sr-only">
          Tracked time per week, oldest first. The last column is this week so
          far.
        </caption>
        <colgroup>
          <col className={LABEL_COLUMN} />
        </colgroup>
        <thead>
          <tr>
            <td />
            {stats.map((week, index) => (
              <th
                key={week.startKey}
                scope="col"
                className={cn(
                  "pb-2 text-center font-normal",
                  index === current
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {index === current ? "This week" : weekLabel(week.startKey)}
                {index === current && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    so far
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y tabular-nums">
          <MetricRow
            label="Tracked"
            stats={stats}
            value={(week) => formatDuration(week.totalSeconds)}
          />
          <MetricRow
            label="Execution"
            stats={stats}
            value={(week) => share(week.executionSeconds, week.totalSeconds)}
          />
          <MetricRow
            label="On goals"
            stats={stats}
            value={(week) => share(week.servingSeconds, week.totalSeconds)}
          />
          <MetricRow
            label="Active days"
            stats={stats}
            value={(week) => week.activeDays}
          />
        </tbody>
      </table>
    </div>
  );
}

function MetricRow({
  label,
  stats,
  value,
}: {
  label: string;
  stats: WeekStats[];
  value: (week: WeekStats) => React.ReactNode;
}) {
  return (
    <tr>
      <th scope="row" className="py-2 text-left font-normal text-muted-foreground">
        {label}
      </th>
      {stats.map((week) => (
        <td key={week.startKey} className="py-2 text-center whitespace-nowrap">
          {value(week)}
        </td>
      ))}
    </tr>
  );
}

function WeekColumn({ week, heightPx }: { week: WeekStats; heightPx: number }) {
  const preparation = week.totalSeconds - week.executionSeconds;

  return (
    <div
      className="group relative flex flex-col items-center justify-end gap-1 pt-6"
      style={{ height: BAR_AREA_PX + 24 }}
    >
      <span className="text-xs font-medium tabular-nums">
        {compactHours(week.totalSeconds)}
      </span>
      {week.totalSeconds > 0 && (
        <div
          className="flex w-6 flex-col gap-0.5 transition-opacity group-hover:opacity-80"
          style={{ height: Math.max(heightPx, 4) }}
        >
          {preparation > 0 && (
            <span
              data-kind="preparation"
              className="rounded-t-[4px] bg-kind"
              style={{ flexGrow: preparation }}
            />
          )}
          {week.executionSeconds > 0 && (
            <span
              data-kind="execution"
              className={cn("bg-kind", preparation === 0 && "rounded-t-[4px]")}
              style={{ flexGrow: week.executionSeconds }}
            />
          )}
        </div>
      )}
      {/* Hover detail; the table below holds the same values. */}
      <div className="pointer-events-none absolute bottom-full z-10 hidden w-max flex-col gap-1 rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm group-hover:flex">
        <TooltipRow kind="execution" seconds={week.executionSeconds} />
        <TooltipRow kind="preparation" seconds={preparation} />
      </div>
    </div>
  );
}

function TooltipRow({
  kind,
  seconds,
}: {
  kind: "execution" | "preparation";
  seconds: number;
}) {
  return (
    <span className="flex items-center gap-2">
      <span data-kind={kind} className="h-0.5 w-3 rounded-full bg-kind" />
      <span className="font-semibold tabular-nums">
        {formatDuration(seconds)}
      </span>
      <span className="text-muted-foreground">
        {kind === "execution" ? "Execution" : "Preparation"}
      </span>
    </span>
  );
}
