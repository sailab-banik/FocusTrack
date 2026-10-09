import type { CategoryKind } from "@/features/categories/category-input";
import { localDayKey } from "@/features/timezone/zoned-time";
import { sessionSeconds } from "./duration";

type TimedSession = {
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
};

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
    const seconds = sessionSeconds(session);
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

/** Seconds spent in execution categories. The rest of a total is preparation. */
export function executionSeconds(
  sessions: (TimedSession & { categoryId: string })[],
  categories: Map<string, { kind: CategoryKind }>,
): number {
  return sessions
    .filter((s) => categories.get(s.categoryId)?.kind === "execution")
    .reduce((total, s) => total + sessionSeconds(s), 0);
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
