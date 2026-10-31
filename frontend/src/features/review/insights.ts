import type { CategoryKind } from "@/features/categories/category-input";
import { sessionSeconds } from "@/features/sessions/duration";
import {
  localDayKey,
  minutesIntoDay,
} from "@/features/timezone/zoned-time";
import { isoWeekday, type Period } from "./periods";

type Span = {
  id: string;
  projectId: string;
  categoryId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
};

type KindOf = Map<string, { kind: CategoryKind }>;

const DAY_MS = 86_400_000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function inPeriod<T extends Span>(spans: T[], period: Period): T[] {
  return spans.filter((span) => {
    const startedAt = new Date(span.startedAt);
    return startedAt >= period.start && startedAt < period.end;
  });
}

function dayKeysOf(startKey: string, count: number): string[] {
  const start = Date.parse(`${startKey}T12:00:00Z`);
  return Array.from({ length: count }, (_, index) =>
    new Date(start + index * DAY_MS).toISOString().slice(0, 10),
  );
}

export type DayTotals = {
  dayKey: string;
  label: string;
  execution: number;
  preparation: number;
};

/** Worked time per day, in the order of `dayKeys`. */
function totalsByDay(
  dayKeys: string[],
  spans: Span[],
  categories: KindOf,
  timeZone: string,
): DayTotals[] {
  const totals = new Map(
    dayKeys.map((dayKey) => [
      dayKey,
      {
        dayKey,
        label: WEEKDAYS[isoWeekday(dayKey) - 1],
        execution: 0,
        preparation: 0,
      },
    ]),
  );
  for (const span of spans) {
    const day = totals.get(localDayKey(new Date(span.startedAt), timeZone));
    if (!day) continue;
    // A category with sessions cannot be removed.
    day[categories.get(span.categoryId)!.kind] += sessionSeconds(span);
  }
  return [...totals.values()];
}

/** Monday to Sunday of the week starting on `startKey`. */
export function weekBars(
  startKey: string,
  spans: Span[],
  categories: KindOf,
  timeZone: string,
): DayTotals[] {
  return totalsByDay(dayKeysOf(startKey, 7), spans, categories, timeZone);
}

export type CalendarDay = DayTotals & {
  dayOfMonth: number;
  future: boolean;
};

export type MonthCalendar = {
  /** Blank cells before the 1st, so columns run Monday to Sunday. */
  leadingBlanks: number;
  days: CalendarDay[];
  trackedDays: number;
  elapsedDays: number;
};

export function monthCalendar(
  period: Period,
  spans: Span[],
  categories: KindOf,
  now: Date,
  timeZone: string,
): MonthCalendar {
  const [year, month] = period.startKey.split("-").map(Number);
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const today = localDayKey(now, timeZone);
  const days = totalsByDay(
    dayKeysOf(period.startKey, length),
    spans,
    categories,
    timeZone,
  ).map((day, index) => ({
    ...day,
    dayOfMonth: index + 1,
    future: day.dayKey > today,
  }));
  return {
    leadingBlanks: isoWeekday(period.startKey) - 1,
    days,
    trackedDays: days.filter((d) => d.execution + d.preparation > 0).length,
    elapsedDays: days.filter((d) => !d.future).length,
  };
}

/** The five steps of the calendar heatmap, 0 for nothing up to 4 for 3h+. */
export function heatLevel(seconds: number): number {
  if (seconds === 0) return 0;
  if (seconds < 3600) return 1;
  if (seconds < 7200) return 2;
  if (seconds < 10800) return 3;
  return 4;
}

export type DayBlockRow = {
  id: string;
  projectId: string;
  categoryId: string;
  /** Hours from the top of the timeline. */
  top: number;
  height: number;
  seconds: number;
  startedAt: string;
  endedAt: string;
};

export type HourTimeline = {
  firstHour: number;
  lastHour: number;
  blocks: DayBlockRow[];
};

/**
 * One day, hour by hour. Starts from a working-day frame of 8 am to 4 pm and
 * grows to fit any session outside it.
 */
export function hourTimeline(spans: Span[], timeZone: string): HourTimeline {
  const placed = spans
    .map((span) => {
      const start = minutesIntoDay(new Date(span.startedAt), timeZone);
      const spanMinutes =
        (Date.parse(span.endedAt) - Date.parse(span.startedAt)) / 60_000;
      return {
        span,
        start,
        // A session running past midnight is cut at the end of its start day.
        end: Math.min(1440, start + spanMinutes),
      };
    })
    .toSorted((a, b) => a.start - b.start);

  const firstHour = Math.min(
    8,
    ...placed.map((p) => Math.floor(p.start / 60)),
  );
  const lastHour = Math.max(16, ...placed.map((p) => Math.ceil(p.end / 60)));

  return {
    firstHour,
    lastHour,
    blocks: placed.map(({ span, start, end }) => ({
      id: span.id,
      projectId: span.projectId,
      categoryId: span.categoryId,
      top: start / 60 - firstHour,
      height: (end - start) / 60,
      seconds: sessionSeconds(span),
      startedAt: span.startedAt,
      endedAt: span.endedAt,
    })),
  };
}

export type ProjectShare = {
  projectId: string;
  execution: number;
  preparation: number;
};

/** Where the time went, most first. */
export function projectShares(
  spans: Span[],
  categories: KindOf,
): ProjectShare[] {
  const shares = new Map<string, ProjectShare>();
  for (const span of spans) {
    const share = shares.get(span.projectId) ?? {
      projectId: span.projectId,
      execution: 0,
      preparation: 0,
    };
    share[categories.get(span.categoryId)!.kind] += sessionSeconds(span);
    shares.set(span.projectId, share);
  }
  return [...shares.values()].toSorted(
    (a, b) => b.execution + b.preparation - (a.execution + a.preparation),
  );
}
