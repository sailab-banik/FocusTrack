import { localDayKey } from "@/features/timezone/zoned-time";
import { durationSeconds } from "./duration";

type TimedSession = { startedAt: string; endedAt: string };

export type DayGroup<T> = {
  dayKey: string;
  totalSeconds: number;
  sessions: T[];
};

/**
 * Groups sessions by the local day they started on, keeping input order.
 * Input is expected newest first, so groups come out newest first.
 */
export function groupSessionsByDay<T extends TimedSession>(
  sessions: T[],
  timeZone: string,
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const session of sessions) {
    const dayKey = localDayKey(new Date(session.startedAt), timeZone);
    const seconds = durationSeconds(
      new Date(session.startedAt),
      new Date(session.endedAt),
    );
    const last = groups.at(-1);
    if (last?.dayKey === dayKey) {
      last.sessions.push(session);
      last.totalSeconds += seconds;
    } else {
      groups.push({ dayKey, totalSeconds: seconds, sessions: [session] });
    }
  }
  return groups;
}

/** "Today", "Yesterday", or e.g. "Thu, Oct 8" for a YYYY-MM-DD day key. */
export function dayLabel(dayKey: string, now: Date, timeZone: string): string {
  const today = localDayKey(now, timeZone);
  if (dayKey === today) return "Today";
  const yesterday = localDayKey(new Date(now.getTime() - 86_400_000), timeZone);
  if (dayKey === yesterday) return "Yesterday";

  // Noon UTC keeps the calendar date stable when formatting as UTC.
  const date = new Date(`${dayKey}T12:00:00Z`);
  const sameYear = dayKey.slice(0, 4) === today.slice(0, 4);
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}
