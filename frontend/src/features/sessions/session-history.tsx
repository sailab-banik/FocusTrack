import Link from "next/link";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { durationSeconds, formatDuration } from "./duration";
import { dayLabel, groupSessionsByDay } from "./history";
import type { PastSession } from "./queries";

type Names = Map<string, string>;

export function SessionHistory({
  sessions,
  projectNames,
  categoryNames,
  overallScores,
  timeZone,
  now,
}: {
  sessions: PastSession[];
  projectNames: Names;
  categoryNames: Names;
  overallScores: Map<string, number>;
  timeZone: string;
  now: Date;
}) {
  return (
    <div className="flex flex-col gap-8">
      {groupSessionsByDay(sessions, timeZone).map((group) => (
        <section key={group.dayKey} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2 border-b pb-1">
            <h2 className="text-sm font-medium">
              {dayLabel(group.dayKey, now, timeZone)}
            </h2>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatDuration(group.totalSeconds)}
            </span>
          </div>
          <ul className="flex flex-col">
            {group.sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                projectName={projectNames.get(session.projectId) ?? ""}
                categoryName={categoryNames.get(session.categoryId) ?? ""}
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

function SessionItem({
  session,
  projectName,
  categoryName,
  overallScore,
  timeZone,
}: {
  session: PastSession;
  projectName: string;
  categoryName: string;
  overallScore: number | null;
  timeZone: string;
}) {
  const startedAt = new Date(session.startedAt);
  const endedAt = new Date(session.endedAt);

  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        className="-mx-2 flex flex-col gap-1 rounded-lg px-2 py-3 hover:bg-muted"
      >
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="truncate font-medium">
            {projectName}{" "}
            <span className="font-normal text-muted-foreground">
              · {categoryName}
            </span>
          </span>
          <span className="shrink-0 text-muted-foreground tabular-nums">
            {formatLocalTime(startedAt, timeZone)}–
            {formatLocalTime(endedAt, timeZone)} ·{" "}
            {formatDuration(durationSeconds(startedAt, endedAt))}
          </span>
        </div>
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
          energy={session.energy}
          difficulty={session.difficulty}
          overallScore={overallScore}
        />
      </Link>
    </li>
  );
}

function Ratings({
  energy,
  difficulty,
  overallScore,
}: {
  energy: number | null;
  difficulty: number | null;
  overallScore: number | null;
}) {
  const parts = [
    energy !== null && `Energy ${energy}/5`,
    difficulty !== null && `Difficulty ${difficulty}/5`,
    overallScore !== null && `AI overall ${overallScore}/5 (estimate)`,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>
  );
}
