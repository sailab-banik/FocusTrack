import { isoWeekday } from "@/features/review/periods";
import { sessionSeconds } from "@/features/sessions/duration";
import { localDayKey } from "@/features/timezone/zoned-time";

const DAY_MS = 86_400_000;

type Span = {
  projectId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
  outcome: string | null;
};

export type ProjectSummary = {
  weekSeconds: number;
  /** The newest session's outcome, skipping sessions that have none. */
  lastComment: string | null;
  lastDayKey: string;
};

function dayNumber(dayKey: string): number {
  return Date.parse(`${dayKey}T00:00:00Z`) / DAY_MS;
}

/** Per project: time this week (from Monday), and how its work last ended. */
export function summarizeProjects(
  spans: Span[],
  now: Date,
  timeZone: string,
): Map<string, ProjectSummary> {
  const today = localDayKey(now, timeZone);
  const monday = dayNumber(today) - (isoWeekday(today) - 1);
  const summaries = new Map<string, ProjectSummary>();

  const oldestFirst = spans.toSorted((a, b) =>
    a.startedAt.localeCompare(b.startedAt),
  );
  for (const span of oldestFirst) {
    const dayKey = localDayKey(new Date(span.startedAt), timeZone);
    const current = summaries.get(span.projectId);
    summaries.set(span.projectId, {
      weekSeconds:
        (current?.weekSeconds ?? 0) +
        (dayNumber(dayKey) >= monday ? sessionSeconds(span) : 0),
      lastComment: span.outcome ?? current?.lastComment ?? null,
      lastDayKey: dayKey,
    });
  }
  return summaries;
}

/** e.g. "Last session today", or "Untouched for 5 days". */
export function lastSessionLine(
  lastDayKey: string | undefined,
  now: Date,
  timeZone: string,
): string {
  if (!lastDayKey) return "No sessions in the last 4 weeks";
  const days = dayNumber(localDayKey(now, timeZone)) - dayNumber(lastDayKey);
  if (days === 0) return "Last session today";
  if (days === 1) return "Last session yesterday";
  return `Untouched for ${days} days`;
}
