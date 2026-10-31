import { describe, expect, it } from "vitest";
import {
  heatLevel,
  hourTimeline,
  monthCalendar,
  projectShares,
  weekBars,
} from "./insights";

const categories = new Map([
  ["build", { kind: "execution" as const }],
  ["learn", { kind: "preparation" as const }],
]);

function span(
  startedAt: string,
  minutes: number,
  categoryId = "build",
  projectId = "app",
) {
  return {
    id: startedAt,
    projectId,
    categoryId,
    startedAt,
    endedAt: new Date(Date.parse(startedAt) + minutes * 60_000).toISOString(),
    pausedSeconds: 0,
  };
}

describe("weekBars", () => {
  it("gives seven days from Monday, split by kind", () => {
    const bars = weekBars(
      "2026-10-05",
      [
        span("2026-10-05T09:00:00Z", 60),
        span("2026-10-05T11:00:00Z", 30, "learn"),
        span("2026-10-11T09:00:00Z", 10),
      ],
      categories,
      "UTC",
    );
    expect(bars.map((b) => b.label)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
    expect(bars[0]).toMatchObject({ execution: 3600, preparation: 1800 });
    expect(bars[6]).toMatchObject({ execution: 600, preparation: 0 });
  });

  it("assigns a session to its local day", () => {
    const bars = weekBars(
      "2026-10-05",
      [span("2026-10-05T20:00:00Z", 60)],
      categories,
      "Asia/Kolkata",
    );
    expect(bars[1].execution).toBe(3600);
  });
});

describe("monthCalendar", () => {
  const period = {
    startKey: "2026-10-01",
    start: new Date("2026-10-01T00:00:00Z"),
    end: new Date("2026-11-01T00:00:00Z"),
  };

  it("lines the 1st up under its weekday and marks the future", () => {
    const calendar = monthCalendar(
      period,
      [span("2026-10-02T09:00:00Z", 60)],
      categories,
      new Date("2026-10-14T12:00:00Z"),
      "UTC",
    );
    // October 1, 2026 is a Thursday.
    expect(calendar.leadingBlanks).toBe(3);
    expect(calendar.days).toHaveLength(31);
    expect(calendar.days[13].future).toBe(false);
    expect(calendar.days[14].future).toBe(true);
    expect(calendar.trackedDays).toBe(1);
    expect(calendar.elapsedDays).toBe(14);
  });
});

describe("heatLevel", () => {
  it("steps up by the hour to 3h+", () => {
    expect(heatLevel(0)).toBe(0);
    expect(heatLevel(3599)).toBe(1);
    expect(heatLevel(3600)).toBe(2);
    expect(heatLevel(7200)).toBe(3);
    expect(heatLevel(10800)).toBe(4);
  });
});

describe("hourTimeline", () => {
  it("keeps the working-day frame when sessions fit inside it", () => {
    const timeline = hourTimeline([span("2026-10-13T09:30:00Z", 90)], "UTC");
    expect(timeline).toMatchObject({ firstHour: 8, lastHour: 16 });
    expect(timeline.blocks[0]).toMatchObject({ top: 1.5, height: 1.5 });
  });

  it("grows to fit early and late sessions", () => {
    const timeline = hourTimeline(
      [span("2026-10-13T06:15:00Z", 30), span("2026-10-13T19:00:00Z", 90)],
      "UTC",
    );
    expect(timeline).toMatchObject({ firstHour: 6, lastHour: 21 });
  });

  it("cuts a session at midnight", () => {
    const timeline = hourTimeline([span("2026-10-13T23:00:00Z", 120)], "UTC");
    expect(timeline.lastHour).toBe(24);
    expect(timeline.blocks[0].height).toBe(1);
  });
});

describe("projectShares", () => {
  it("sorts projects by time, split by kind", () => {
    expect(
      projectShares(
        [
          span("2026-10-13T09:00:00Z", 10, "build", "small"),
          span("2026-10-13T10:00:00Z", 60, "build", "big"),
          span("2026-10-13T11:00:00Z", 30, "learn", "big"),
        ],
        categories,
      ),
    ).toEqual([
      { projectId: "big", execution: 3600, preparation: 1800 },
      { projectId: "small", execution: 600, preparation: 0 },
    ]);
  });
});
