import type { CategoryKind } from "@/features/categories/category-input";
import { sessionSeconds } from "@/features/sessions/duration";
import type { SessionSpan } from "@/features/sessions/queries";
import { localDayKey, localMidnight } from "@/features/timezone/zoned-time";

export type Week = {
  /** Monday's YYYY-MM-DD in the user's timezone. */
  startKey: string;
  start: Date;
  /** Exclusive: the next Monday's local midnight. */
  end: Date;
};

function addDays(dayKey: string, days: number): string {
  // Noon UTC keeps the calendar date stable while stepping days.
  const date = new Date(`${dayKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 1 for Monday through 7 for Sunday. */
export function isoWeekday(dayKey: string): number {
  const day = new Date(`${dayKey}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/**
 * The current week and the `previous` full weeks before it, oldest first.
 * Weeks run Monday to Sunday in the user's timezone.
 */
export function recentWeeks(
  now: Date,
  timeZone: string,
  previous: number,
): Week[] {
  const today = localDayKey(now, timeZone);
  const currentMonday = addDays(today, 1 - isoWeekday(today));
  return Array.from({ length: previous + 1 }, (_, index) => {
    const startKey = addDays(currentMonday, (index - previous) * 7);
    return {
      startKey,
      start: localMidnight(startKey, timeZone),
      end: localMidnight(addDays(startKey, 7), timeZone),
    };
  });
}

export type WeekStats = {
  startKey: string;
  totalSeconds: number;
  executionSeconds: number;
  /** Time on projects linked to an active goal. */
  servingSeconds: number;
  sessionCount: number;
  activeDays: number;
};

/** Totals per week, matching sessions to the week they started in. */
export function weekStats(
  weeks: Week[],
  spans: Omit<SessionSpan, "id">[],
  kindOf: Map<string, CategoryKind>,
  servingProjectIds: Set<string>,
  timeZone: string,
): WeekStats[] {
  return weeks.map((week) => {
    const inWeek = spans.filter((span) => {
      const startedAt = new Date(span.startedAt);
      return startedAt >= week.start && startedAt < week.end;
    });
    let executionSeconds = 0;
    let servingSeconds = 0;
    let totalSeconds = 0;
    for (const span of inWeek) {
      const seconds = sessionSeconds(span);
      totalSeconds += seconds;
      if (kindOf.get(span.categoryId) === "execution") {
        executionSeconds += seconds;
      }
      if (servingProjectIds.has(span.projectId)) servingSeconds += seconds;
    }
    return {
      startKey: week.startKey,
      totalSeconds,
      executionSeconds,
      servingSeconds,
      sessionCount: inWeek.length,
      activeDays: new Set(
        inWeek.map((span) => localDayKey(new Date(span.startedAt), timeZone)),
      ).size,
    };
  });
}
