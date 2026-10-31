import { KindMark } from "@/features/categories/kind-mark";
import type { Category } from "@/features/categories/queries";
import { formatDuration } from "@/features/sessions/duration";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { CHART_CARD } from "./chart-card";
import type { HourTimeline } from "./insights";

const HOUR_PX = 34;
const MIN_BLOCK_PX = 40;

function hourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return "12 am";
  if (hour === 12) return "12 pm";
  return hour > 12 ? `${hour - 12} pm` : `${hour} am`;
}

/** One day hour by hour, each session where it happened. */
export function DayHours({
  title,
  summary,
  timeline,
  projects,
  categories,
  timeZone,
}: {
  title: string;
  summary: string;
  timeline: HourTimeline;
  projects: Map<string, string>;
  categories: Map<string, Category>;
  timeZone: string;
}) {
  const hours = Array.from(
    { length: timeline.lastHour - timeline.firstHour + 1 },
    (_, index) => timeline.firstHour + index,
  );

  return (
    <section aria-labelledby="day-chart" className={CHART_CARD}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="day-chart" className="font-serif text-xl">
          {title}
        </h3>
        <span className="text-[13px] text-ink-soft">{summary}</span>
      </div>
      <div className="relative mt-2 flex flex-col pl-[52px]">
        {hours.map((hour) => (
          <div
            key={hour}
            className="relative border-t border-line-soft"
            style={{ height: HOUR_PX }}
          >
            <span className="absolute -top-2 -left-[52px] text-[11px] text-ink-muted">
              {hourLabel(hour)}
            </span>
          </div>
        ))}
        {timeline.blocks.map((block, index) => {
          // A category with sessions cannot be removed.
          const category = categories.get(block.categoryId)!;
          return (
            <div
              key={block.id}
              data-kind={category.kind}
              className="ft-in absolute right-1 left-[60px] flex items-center gap-2 overflow-hidden rounded-[10px] bg-kind-soft px-2.5 py-1.5"
              style={{
                top: block.top * HOUR_PX,
                height: Math.max(MIN_BLOCK_PX, block.height * HOUR_PX),
                animationDelay: `${200 + index * 120}ms`,
              }}
            >
              <KindMark kind={category.kind} className="size-2" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-semibold">
                  {projects.get(block.projectId)}
                </span>
                <span className="truncate text-xs text-ink-soft">
                  {category.name} ·{" "}
                  {formatLocalTime(new Date(block.startedAt), timeZone)}–
                  {formatLocalTime(new Date(block.endedAt), timeZone)} ·{" "}
                  {formatDuration(block.seconds)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
