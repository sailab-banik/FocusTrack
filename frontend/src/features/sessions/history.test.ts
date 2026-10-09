import { describe, expect, it } from "vitest";
import { dayLabel, groupSessionsByDay } from "./history";

function session(id: string, startedAt: string, endedAt: string) {
  return { id, startedAt, endedAt };
}

describe("groupSessionsByDay", () => {
  const sessions = [
    session("c", "2026-10-09T19:00:00Z", "2026-10-09T20:00:00Z"),
    session("b", "2026-10-09T09:00:00Z", "2026-10-09T09:30:00Z"),
    session("a", "2026-10-08T09:00:00Z", "2026-10-08T11:00:00Z"),
  ];

  it("groups by local day and totals durations", () => {
    expect(groupSessionsByDay(sessions, "UTC")).toEqual([
      {
        dayKey: "2026-10-09",
        totalSeconds: 5400,
        sessions: [sessions[0], sessions[1]],
      },
      { dayKey: "2026-10-08", totalSeconds: 7200, sessions: [sessions[2]] },
    ]);
  });

  it("uses the user's timezone for day boundaries", () => {
    // 19:00 UTC is 00:30 the next day in Kolkata.
    const groups = groupSessionsByDay(sessions, "Asia/Kolkata");
    expect(groups.map((g) => g.dayKey)).toEqual([
      "2026-10-10",
      "2026-10-09",
      "2026-10-08",
    ]);
  });

  it("returns no groups for no sessions", () => {
    expect(groupSessionsByDay([], "UTC")).toEqual([]);
  });
});

describe("dayLabel", () => {
  const now = new Date("2026-10-09T12:00:00Z");

  it("names today and yesterday", () => {
    expect(dayLabel("2026-10-09", now, "UTC")).toBe("Today");
    expect(dayLabel("2026-10-08", now, "UTC")).toBe("Yesterday");
  });

  it("formats older days, adding the year only when it differs", () => {
    expect(dayLabel("2026-10-05", now, "UTC")).toBe("Mon, Oct 5");
    expect(dayLabel("2025-12-31", now, "UTC")).toBe("Wed, Dec 31, 2025");
  });
});
