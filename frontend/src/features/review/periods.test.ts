import { describe, expect, it } from "vitest";
import {
  closedPeriods,
  isoWeekday,
  periodLabel,
  periodStats,
  recentWeeks,
} from "./periods";

describe("isoWeekday", () => {
  it("numbers Monday 1 through Sunday 7", () => {
    expect(isoWeekday("2026-10-12")).toBe(1);
    expect(isoWeekday("2026-10-18")).toBe(7);
  });
});

describe("recentWeeks", () => {
  // Tuesday 13 Oct 2026, 10:00 UTC.
  const now = new Date("2026-10-13T10:00:00Z");

  it("returns the current week last, after the previous ones", () => {
    const weeks = recentWeeks(now, "UTC", 2);
    expect(weeks.map((w) => w.startKey)).toEqual([
      "2026-09-28",
      "2026-10-05",
      "2026-10-12",
    ]);
    expect(weeks[2].start).toEqual(new Date("2026-10-12T00:00:00Z"));
    expect(weeks[2].end).toEqual(new Date("2026-10-19T00:00:00Z"));
  });

  it("starts weeks at local midnight on Monday", () => {
    const [week] = recentWeeks(now, "Asia/Kolkata", 0);
    expect(week.startKey).toBe("2026-10-12");
    expect(week.start).toEqual(new Date("2026-10-11T18:30:00Z"));
  });

  it("treats Sunday as the last day of its week", () => {
    const sunday = new Date("2026-10-18T12:00:00Z");
    expect(recentWeeks(sunday, "UTC", 0)[0].startKey).toBe("2026-10-12");
  });
});

describe("closedPeriods", () => {
  // Tuesday 13 Oct 2026, 10:00 UTC.
  const now = new Date("2026-10-13T10:00:00Z");

  it("ends with yesterday", () => {
    const days = closedPeriods("day", now, "UTC", 2);
    expect(days.map((d) => d.startKey)).toEqual(["2026-10-11", "2026-10-12"]);
    expect(days[1].start).toEqual(new Date("2026-10-12T00:00:00Z"));
    expect(days[1].end).toEqual(new Date("2026-10-13T00:00:00Z"));
  });

  it("ends with last week, Monday to Sunday", () => {
    const weeks = closedPeriods("week", now, "UTC", 2);
    expect(weeks.map((w) => w.startKey)).toEqual(["2026-09-28", "2026-10-05"]);
    expect(weeks[1].end).toEqual(new Date("2026-10-12T00:00:00Z"));
  });

  it("ends with last month", () => {
    const months = closedPeriods("month", now, "UTC", 3);
    expect(months.map((m) => m.startKey)).toEqual([
      "2026-07-01",
      "2026-08-01",
      "2026-09-01",
    ]);
    expect(months[2].end).toEqual(new Date("2026-10-01T00:00:00Z"));
  });

  it("steps months back across a year boundary", () => {
    const january = new Date("2027-01-15T10:00:00Z");
    expect(
      closedPeriods("month", january, "UTC", 2).map((m) => m.startKey),
    ).toEqual(["2026-11-01", "2026-12-01"]);
  });

  it("uses the user's day, not the server's", () => {
    // 20:00 UTC on the 13th is already the 14th in Kolkata.
    const evening = new Date("2026-10-13T20:00:00Z");
    const [yesterday] = closedPeriods("day", evening, "Asia/Kolkata", 1);
    expect(yesterday.startKey).toBe("2026-10-13");
    expect(yesterday.start).toEqual(new Date("2026-10-12T18:30:00Z"));

    // 03:00 UTC on the 13th is still the 12th in Los Angeles.
    const night = new Date("2026-10-13T03:00:00Z");
    expect(
      closedPeriods("day", night, "America/Los_Angeles", 1)[0].startKey,
    ).toBe("2026-10-11");
  });
});

describe("periodLabel", () => {
  const now = new Date("2026-10-13T10:00:00Z");

  it("names a day relative to today", () => {
    expect(periodLabel("day", "2026-10-12", now, "UTC")).toBe("Yesterday");
    expect(periodLabel("day", "2026-10-08", now, "UTC")).toBe("Thu, Oct 8");
  });

  it("names a week by its Monday and a month by name", () => {
    expect(periodLabel("week", "2026-10-05", now, "UTC")).toBe("Week of Oct 5");
    expect(periodLabel("month", "2026-09-01", now, "UTC")).toBe(
      "September 2026",
    );
  });
});

describe("periodStats", () => {
  const weeks = recentWeeks(new Date("2026-10-13T10:00:00Z"), "UTC", 1);
  const kindOf = new Map([
    ["build", "execution" as const],
    ["learn", "preparation" as const],
  ]);

  function span(projectId: string, categoryId: string, startedAt: string) {
    const start = new Date(startedAt);
    return {
      projectId,
      categoryId,
      startedAt,
      endedAt: new Date(start.getTime() + 3_600_000).toISOString(),
      pausedSeconds: 0,
    };
  }

  it("totals each week's time, execution, goal time, and active days", () => {
    const stats = periodStats(
      weeks,
      [
        span("app", "build", "2026-10-06T09:00:00Z"),
        span("side", "learn", "2026-10-06T14:00:00Z"),
        span("app", "learn", "2026-10-08T09:00:00Z"),
        span("app", "build", "2026-10-12T09:00:00Z"),
      ],
      kindOf,
      new Set(["app"]),
      "UTC",
    );
    expect(stats).toEqual([
      {
        startKey: "2026-10-05",
        totalSeconds: 10800,
        executionSeconds: 3600,
        servingSeconds: 7200,
        sessionCount: 3,
        activeDays: 2,
      },
      {
        startKey: "2026-10-12",
        totalSeconds: 3600,
        executionSeconds: 3600,
        servingSeconds: 3600,
        sessionCount: 1,
        activeDays: 1,
      },
    ]);
  });

  it("puts a session in the week it started in", () => {
    // Sunday 23:30 to Monday 00:30.
    const stats = periodStats(
      weeks,
      [span("app", "build", "2026-10-11T23:30:00Z")],
      kindOf,
      new Set(),
      "UTC",
    );
    expect(stats.map((s) => s.sessionCount)).toEqual([1, 0]);
  });
});
