import type { CategoryKind } from "@/features/categories/category-input";
import { sessionSeconds } from "@/features/sessions/duration";
import { dayLabel } from "@/features/sessions/history";
import type { SessionSpan } from "@/features/sessions/queries";
import { localDayKey, localMidnight } from "@/features/timezone/zoned-time";

export const PERIOD_KINDS = ["day", "week", "month"] as const;
export type PeriodKind = (typeof PERIOD_KINDS)[number];

export type Period = {
  /** The first day's YYYY-MM-DD in the user's timezone. */
  startKey: string;
  start: Date;
  /** Exclusive: local midnight after the last day. */
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

/** Weeks run Monday to Sunday. */
function startKeyOf(kind: PeriodKind, dayKey: string): string {
  if (kind === "day") return dayKey;
  if (kind === "week") return addDays(dayKey, 1 - isoWeekday(dayKey));
  return `${dayKey.slice(0, 8)}01`;
}

/** The start of the period `count` periods after the one starting on `startKey`. */
function shift(kind: PeriodKind, startKey: string, count: number): string {
  if (kind === "day") return addDays(startKey, count);
  if (kind === "week") return addDays(startKey, count * 7);
  const date = new Date(`${startKey}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + count);
  return date.toISOString().slice(0, 10);
}

function toPeriod(kind: PeriodKind, startKey: string, timeZone: string): Period {
  return {
    startKey,
    start: localMidnight(startKey, timeZone),
    end: localMidnight(shift(kind, startKey, 1), timeZone),
  };
}

/**
 * The last `count` periods that have ended in the user's timezone, oldest
 * first: the final entry is yesterday, last week, or last month.
 */
export function closedPeriods(
  kind: PeriodKind,
  now: Date,
  timeZone: string,
  count: number,
): Period[] {
  const current = startKeyOf(kind, localDayKey(now, timeZone));
  return Array.from({ length: count }, (_, index) =>
    toPeriod(kind, shift(kind, current, index - count), timeZone),
  );
}

/** The current week and the `previous` full weeks before it, oldest first. */
export function recentWeeks(
  now: Date,
  timeZone: string,
  previous: number,
): Period[] {
  const current = startKeyOf("week", localDayKey(now, timeZone));
  return [
    ...closedPeriods("week", now, timeZone, previous),
    toPeriod("week", current, timeZone),
  ];
}

function formatDayKey(
  dayKey: string,
  options: Intl.DateTimeFormatOptions,
): string {
  // Noon UTC keeps the calendar date stable when formatting as UTC.
  return new Date(`${dayKey}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...options,
  });
}

/** "Yesterday" or "Thu, Oct 8"; "Week of Oct 5"; "September 2026". */
export function periodLabel(
  kind: PeriodKind,
  startKey: string,
  now: Date,
  timeZone: string,
): string {
  if (kind === "day") return dayLabel(startKey, now, timeZone);
  if (kind === "week") {
    return `Week of ${formatDayKey(startKey, { month: "short", day: "numeric" })}`;
  }
  return formatDayKey(startKey, { month: "long", year: "numeric" });
}

export type PeriodStats = {
  startKey: string;
  totalSeconds: number;
  executionSeconds: number;
  /** Time on projects linked to an active goal. */
  servingSeconds: number;
  sessionCount: number;
  activeDays: number;
};

/** Totals per period, matching sessions to the period they started in. */
export function periodStats(
  periods: Period[],
  spans: Omit<SessionSpan, "id">[],
  kindOf: Map<string, CategoryKind>,
  servingProjectIds: Set<string>,
  timeZone: string,
): PeriodStats[] {
  return periods.map((period) => {
    const inPeriod = spans.filter((span) => {
      const startedAt = new Date(span.startedAt);
      return startedAt >= period.start && startedAt < period.end;
    });
    let executionSeconds = 0;
    let servingSeconds = 0;
    let totalSeconds = 0;
    for (const span of inPeriod) {
      const seconds = sessionSeconds(span);
      totalSeconds += seconds;
      if (kindOf.get(span.categoryId) === "execution") {
        executionSeconds += seconds;
      }
      if (servingProjectIds.has(span.projectId)) servingSeconds += seconds;
    }
    return {
      startKey: period.startKey,
      totalSeconds,
      executionSeconds,
      servingSeconds,
      sessionCount: inPeriod.length,
      activeDays: new Set(
        inPeriod.map((span) => localDayKey(new Date(span.startedAt), timeZone)),
      ).size,
    };
  });
}
