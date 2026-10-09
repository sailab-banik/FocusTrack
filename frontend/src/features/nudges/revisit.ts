import { sessionSeconds } from "@/features/sessions/duration";
import { localDayKey } from "@/features/timezone/zoned-time";

// A project is worth a nudge when it had momentum and then went quiet: worked
// on at least MIN_ACTIVE_DAYS of the RUN_WINDOW_DAYS up to its last session,
// then untouched for MIN_DAYS_SINCE days. Past MAX_DAYS_SINCE it has been
// dropped rather than lapsed, and repeating the nudge would only be noise.
export const MIN_ACTIVE_DAYS = 2;
export const RUN_WINDOW_DAYS = 7;
export const MIN_DAYS_SINCE = 3;
export const MAX_DAYS_SINCE = 14;

/** How many days of sessions are needed to judge every project. */
export const LOOKBACK_DAYS = MAX_DAYS_SINCE + RUN_WINDOW_DAYS;

export type SessionSpan = {
  projectId: string;
  categoryId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
};

export type RevisitNudge = {
  projectId: string;
  projectName: string;
  /** Category of the last session, so the work can restart in one tap. */
  categoryId: string;
  /** Local day of the last session, as YYYY-MM-DD. */
  lastDayKey: string;
  daysSince: number;
  /** The run before the gap. */
  activeDays: number;
  sessionCount: number;
  workedSeconds: number;
};

/** Most recently lapsed first: those are the easiest to pick back up. */
export function findRevisitNudges(
  spans: SessionSpan[],
  projects: { id: string; name: string; archived: boolean }[],
  now: Date,
  timeZone: string,
): RevisitNudge[] {
  const today = dayNumber(localDayKey(now, timeZone));
  const nudges: RevisitNudge[] = [];

  for (const project of projects) {
    if (project.archived) continue;
    const sessions = spans
      .filter((span) => span.projectId === project.id)
      .map((span) => ({
        span,
        dayKey: localDayKey(new Date(span.startedAt), timeZone),
      }));
    if (sessions.length === 0) continue;

    const last = sessions.reduce((latest, session) =>
      session.span.startedAt > latest.span.startedAt ? session : latest,
    );
    const lastDay = dayNumber(last.dayKey);
    const daysSince = today - lastDay;
    if (daysSince < MIN_DAYS_SINCE || daysSince > MAX_DAYS_SINCE) continue;

    const run = sessions.filter(
      (session) => dayNumber(session.dayKey) > lastDay - RUN_WINDOW_DAYS,
    );
    const activeDays = new Set(run.map((session) => session.dayKey)).size;
    if (activeDays < MIN_ACTIVE_DAYS) continue;

    nudges.push({
      projectId: project.id,
      projectName: project.name,
      categoryId: last.span.categoryId,
      lastDayKey: last.dayKey,
      daysSince,
      activeDays,
      sessionCount: run.length,
      workedSeconds: run.reduce(
        (total, session) => total + sessionSeconds(session.span),
        0,
      ),
    });
  }

  return nudges.sort(
    (a, b) => a.daysSince - b.daysSince || b.workedSeconds - a.workedSeconds,
  );
}

function dayNumber(dayKey: string): number {
  return Date.parse(`${dayKey}T00:00:00Z`) / 86_400_000;
}
