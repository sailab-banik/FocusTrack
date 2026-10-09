import Link from "next/link";
import type { Category } from "@/features/categories/queries";
import { KindMark } from "@/features/categories/kind-mark";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { formatDuration, sessionSeconds } from "./duration";
import { dayLabel, executionSeconds, groupSessionsByDay } from "./history";
import type { PastSession } from "./queries";

type Categories = Map<string, Category>;

export function SessionHistory({
  sessions,
  projectNames,
  categories,
  overallScores,
  timeZone,
  now,
}: {
  sessions: PastSession[];
  projectNames: Map<string, string>;
  categories: Categories;
  overallScores: Map<string, number>;
  timeZone: string;
  now: Date;
}) {
  return (
    <div className="flex flex-col gap-12">
      {groupSessionsByDay(sessions, timeZone).map((group) => (
        <section key={group.dayKey} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {dayLabel(group.dayKey, now, timeZone)}
            </h2>
            <span className="text-xl font-semibold tabular-nums">
              {formatDuration(group.totalSeconds)}
            </span>
          </div>
          <KindSplit
            execution={executionSeconds(group.sessions, categories)}
            total={group.totalSeconds}
          />
          <ul className="mt-2 flex flex-col divide-y border-t">
            {group.sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                projectName={projectNames.get(session.projectId) ?? ""}
                category={categories.get(session.categoryId)}
                overallScore={overallScores.get(session.id) ?? null}
                timeZone={timeZone}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// How the day's time divides between producing output and getting ready to.
function KindSplit({ execution, total }: { execution: number; total: number }) {
  const parts = [
    { kind: "execution", label: "Execution", seconds: execution },
    { kind: "preparation", label: "Preparation", seconds: total - execution },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-2 gap-0.5" aria-hidden>
        {parts.map(
          (part) =>
            part.seconds > 0 && (
              <span
                key={part.kind}
                data-kind={part.kind}
                className="min-w-1 rounded-full bg-kind"
                style={{ flexGrow: part.seconds }}
              />
            ),
        )}
      </div>
      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {parts.map((part) => (
          <div key={part.kind} className="flex items-center gap-1.5">
            <KindMark kind={part.kind} />
            <dt className="text-muted-foreground">{part.label}</dt>
            <dd className="font-medium tabular-nums">
              {formatDuration(part.seconds)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SessionItem({
  session,
  projectName,
  category,
  overallScore,
  timeZone,
}: {
  session: PastSession;
  projectName: string;
  category: Category | undefined;
  overallScore: number | null;
  timeZone: string;
}) {
  const startedAt = new Date(session.startedAt);
  const endedAt = new Date(session.endedAt);

  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        className="-mx-3 grid gap-x-4 gap-y-1 rounded-xl px-3 py-4 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
      >
        <span className="text-sm text-muted-foreground tabular-nums sm:pt-0.5">
          {formatLocalTime(startedAt, timeZone)}–
          {formatLocalTime(endedAt, timeZone)}
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-semibold">{projectName}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {formatDuration(sessionSeconds(session))}
            </span>
          </div>
          {category && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <KindMark kind={category.kind} />
              {category.name}
            </span>
          )}
          {session.description ? (
            <p className="text-sm">{session.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No log yet. Tap to add one.
            </p>
          )}
          {session.outcome && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Outcome:</span>{" "}
              {session.outcome}
            </p>
          )}
          <Ratings
            pausedSeconds={session.pausedSeconds}
            energy={session.energy}
            difficulty={session.difficulty}
            overallScore={overallScore}
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
  overallScore,
}: {
  pausedSeconds: number;
  energy: number | null;
  difficulty: number | null;
  overallScore: number | null;
}) {
  const parts = [
    // Explains why the duration is shorter than the time range.
    pausedSeconds >= 60 && `Paused ${formatDuration(pausedSeconds)}`,
    energy !== null && `Energy ${energy}/5`,
    difficulty !== null && `Difficulty ${difficulty}/5`,
    overallScore !== null && `AI overall ${overallScore}/5 (estimate)`,
  ].filter((part) => part !== false);
  if (parts.length === 0) return null;
  return (
    <p className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
      {parts.map((part) => (
        <span key={part}>{part}</span>
      ))}
    </p>
  );
}
