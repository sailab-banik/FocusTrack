import Link from "next/link";
import { KindMark } from "@/features/categories/kind-mark";
import type { Category } from "@/features/categories/queries";
import { ProjectTile } from "@/features/projects/project-tile";
import type { Project } from "@/features/projects/queries";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { DayTimeline } from "./day-timeline";
import { formatDuration, sessionSeconds } from "./duration";
import { dayBlocks, executionSeconds } from "./history";
import { KindTotals } from "./kind-totals";
import type { SessionSpan } from "./queries";
import { SplitBar } from "./split-bar";

const CARD =
  "rounded-[20px] bg-paper shadow-[0_1px_2px_rgb(31_27_61/.05),0_8px_24px_rgb(46_42_120/.06)] md:rounded-3xl";

const JUST_SAVED_MS = 60_000;

/** Today's finished sessions, newest first. */
export function TodayPanel({
  spans,
  categories,
  projects,
  timeZone,
  now,
}: {
  spans: SessionSpan[];
  categories: Category[];
  projects: Project[];
  timeZone: string;
  now: Date;
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const total = spans.reduce((sum, span) => sum + sessionSeconds(span), 0);
  const execution = executionSeconds(spans, categoryById);
  const newestFirst = spans.toSorted((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  return (
    <section aria-labelledby="today-heading" className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 px-1 md:hidden">
        <div className="flex items-baseline justify-between">
          <h2 id="today-heading" className="font-serif text-xl">
            Today so far
          </h2>
          <span className="text-[15px] font-bold">
            {formatDuration(total)}
          </span>
        </div>
        <SplitBar
          execution={execution}
          preparation={total - execution}
          className="h-2.5"
        />
        <KindTotals execution={execution} preparation={total - execution} />
      </div>

      <div className={`${CARD} flex flex-col px-4 py-1 md:px-7 md:pt-6 md:pb-3`}>
        <div className="hidden items-baseline justify-between md:flex">
          <p className="font-serif text-[22px]">Today so far</p>
          <Link
            href="/log"
            className="text-[13px] font-semibold text-indigo"
          >
            Open log
          </Link>
        </div>
        <div className="mt-[18px] mb-1.5 hidden md:block">
          <DayTimeline blocks={dayBlocks(spans, categoryById, timeZone)} />
        </div>
        {spans.length === 0 ? (
          <p className="py-4 text-sm text-ink-soft md:border-t md:border-line-soft">
            Nothing finished yet today. Each session lands here when you stop
            it.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line-soft md:mt-2.5 md:border-t md:border-line-soft">
            {newestFirst.map((span) => {
              // Foreign keys keep a session's project and category.
              const category = categoryById.get(span.categoryId)!;
              const project = projectById.get(span.projectId)!;
              const start = formatLocalTime(new Date(span.startedAt), timeZone);
              const end = formatLocalTime(new Date(span.endedAt), timeZone);
              return (
                <li
                  key={span.id}
                  // A session just saved arrives highlighted.
                  className={
                    now.getTime() - Date.parse(span.endedAt) < JUST_SAVED_MS
                      ? "ft-row rounded-xl"
                      : undefined
                  }
                >
                  <Link
                    href={`/log/${span.id}`}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl py-3 md:-mx-2 md:gap-3.5 md:px-2 md:py-4 md:hover:bg-mist"
                  >
                    <ProjectTile id={project.id} name={project.name} />
                    <span className="flex min-w-0 flex-col gap-0.5 md:gap-1">
                      <span className="truncate font-serif text-[15px] leading-[21px] md:whitespace-normal md:text-[17px] md:leading-6">
                        {span.outcome ?? project.name}
                      </span>
                      <span
                        data-kind={category.kind}
                        className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-soft md:text-[13px]"
                      >
                        <span className="hidden md:inline">
                          {project.name} ·
                        </span>
                        <span className="inline-flex items-center gap-[5px] font-medium text-kind-text">
                          <KindMark kind={category.kind} className="size-[7px]" />
                          {category.name}
                          <span className="sr-only">({category.kind})</span>
                        </span>
                        <span>
                          · {start}
                          <span className="hidden md:inline">–{end}</span>
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold md:text-[15px]">
                      {formatDuration(sessionSeconds(span))}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

/** The day's total and split, beside the session list on desktop. */
export function TrackedToday({
  spans,
  categories,
}: {
  spans: SessionSpan[];
  categories: Category[];
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const total = spans.reduce((sum, span) => sum + sessionSeconds(span), 0);
  const execution = executionSeconds(spans, categoryById);

  return (
    <section
      aria-labelledby="tracked-heading"
      className="hidden flex-col gap-3.5 rounded-3xl bg-paper p-6 shadow-[0_1px_2px_rgb(31_27_61/.05),0_16px_40px_rgb(46_42_120/.1)] lg:flex"
    >
      <h2 id="tracked-heading" className="text-sm font-semibold text-ink-soft">
        Tracked today
      </h2>
      <span className="font-serif text-[40px] leading-11">
        {formatDuration(total)}
      </span>
      <SplitBar execution={execution} preparation={total - execution} />
      <KindTotals
        execution={execution}
        preparation={total - execution}
        stacked
      />
      <p className="mt-1 text-[13px] leading-[19px] text-ink-muted">
        A running session joins this once you stop it.
      </p>
    </section>
  );
}
