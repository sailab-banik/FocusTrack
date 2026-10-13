import { describe, expect, it } from "vitest";
import { isoWeekday, recentWeeks, weekStats } from "./weeks";

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

describe("weekStats", () => {
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
    const stats = weekStats(
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
    const stats = weekStats(
      weeks,
      [span("app", "build", "2026-10-11T23:30:00Z")],
      kindOf,
      new Set(),
      "UTC",
    );
    expect(stats.map((s) => s.sessionCount)).toEqual([1, 0]);
  });
});
