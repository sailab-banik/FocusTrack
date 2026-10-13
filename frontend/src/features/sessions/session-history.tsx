import Link from "next/link";
import type { Category } from "@/features/categories/queries";
import { KindMark } from "@/features/categories/kind-mark";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { DayStrip } from "./day-strip";
import { formatDuration, sessionSeconds } from "./duration";
import {
  dayBlocks,
  dayLabel,
  executionSeconds,
  groupSessionsByDay,
} from "./history";
import { KindTotals } from "./kind-totals";
import type { PastSession } from "./queries";

type Categories = Map<string, Category>;

export function SessionHistory({
  sessions,
  projectNames,
  categories,
  timeZone,
  now,
}: {
  sessions: PastSession[];
  projectNames: Map<string, string>;
  categories: Categories;
  timeZone: string;
  now: Date;
}) {
  return (
    <div className="flex flex-col gap-12">
      {groupSessionsByDay(sessions, timeZone).map((group) => {
        const execution = executionSeconds(group.sessions, categories);
        return (
          <section key={group.dayKey} className="flex flex-col gap-3">
            {/* Stays under the app header so the day is known mid-scroll. */}
            <div className="sticky top-14 z-10 -mx-4 flex items-center justify-between gap-3 bg-background px-4 py-2">
              <h2 className="truncate text-xl font-semibold tracking-tight">
                {dayLabel(group.dayKey, now, timeZone)}
              </h2>
              <div className="flex shrink-0 items-center gap-3">
                <DayStrip
                  blocks={dayBlocks(group.sessions, categories, timeZone)}
                />
                <span className="text-xl font-semibold tabular-nums">
                  {formatDuration(group.totalSeconds)}
                </span>
              </div>
            </div>
            <KindTotals
              execution={execution}
              preparation={group.totalSeconds - execution}
            />
            <ul className="mt-1 flex flex-col divide-y border-t">
              {group.sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  projectName={projectNames.get(session.projectId) ?? ""}
                  category={categories.get(session.categoryId)}
                  timeZone={timeZone}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// The outcome leads: what a session produced matters more than its topic.
function SessionItem({
  session,
  projectName,
  category,
  timeZone,
}: {
  session: PastSession;
  projectName: string;
  category: Category | undefined;
  timeZone: string;
}) {
  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        className="-mx-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 rounded-xl px-3 py-4 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]"
      >
        <span className="text-sm text-muted-foreground tabular-nums sm:pt-0.5">
          {formatLocalTime(new Date(session.startedAt), timeZone)}–
          {formatLocalTime(new Date(session.endedAt), timeZone)}
        </span>
        <span className="col-start-2 row-start-1 text-right font-semibold tabular-nums sm:col-start-3">
          {formatDuration(sessionSeconds(session))}
        </span>
        <div className="col-span-2 flex min-w-0 flex-col gap-1 sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="truncate font-semibold">{projectName}</span>
            {category && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <KindMark kind={category.kind} />
                {category.name}
              </span>
            )}
          </div>
          {session.outcome ? (
            <p>{session.outcome}</p>
          ) : (
            <p className="text-muted-foreground italic">
              No log yet. Tap to add one.
            </p>
          )}
          {session.description && (
            <p className="text-sm text-muted-foreground">
              {session.description}
            </p>
          )}
          <Ratings
            pausedSeconds={session.pausedSeconds}
            energy={session.energy}
            difficulty={session.difficulty}
          />
        </div>
      </Link>
    </li>
  );
}

function Ratings({
  pausedSeconds,
  energy,
  difficulty,
}: {
  pausedSeconds: number;
  energy: number | null;
  difficulty: number | null;
}) {
  const parts = [
    // Explains why the duration is shorter than the time range.
    pausedSeconds >= 60 && `Paused ${formatDuration(pausedSeconds)}`,
    energy !== null && `Energy ${energy}/5`,
    difficulty !== null && `Difficulty ${difficulty}/5`,
  ].filter((part) => part !== false);
  if (parts.length === 0) return null;
  return (
    <p className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
      {parts.map((part) => (
        <span key={part}>{part}</span>
      ))}
    </p>
  );
}
