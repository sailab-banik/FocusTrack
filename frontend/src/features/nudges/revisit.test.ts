import { describe, expect, it } from "vitest";
import { findRevisitNudges, type SessionSpan } from "./revisit";

const NOW = new Date("2026-10-09T12:00:00Z");
const dsa = { id: "dsa", name: "DSA", archived: false };

function span(
  projectId: string,
  day: string,
  minutes: number,
  categoryId = "practice",
): SessionSpan {
  const startedAt = `2026-${day}T09:00:00Z`;
  return {
    projectId,
    categoryId,
    startedAt,
    endedAt: new Date(Date.parse(startedAt) + minutes * 60_000).toISOString(),
    pausedSeconds: 0,
  };
}

describe("findRevisitNudges", () => {
  it("flags a project worked two days running and then left for three", () => {
    const spans = [span("dsa", "10-05", 40), span("dsa", "10-06", 60, "learn")];
    expect(findRevisitNudges(spans, [dsa], NOW, "UTC")).toEqual([
      {
        projectId: "dsa",
        projectName: "DSA",
        categoryId: "learn",
        lastDayKey: "2026-10-06",
        daysSince: 3,
        activeDays: 2,
        sessionCount: 2,
        workedSeconds: 6000,
      },
    ]);
  });

  it("waits until the gap is three days", () => {
    const spans = [span("dsa", "10-06", 40), span("dsa", "10-07", 60)];
    expect(findRevisitNudges(spans, [dsa], NOW, "UTC")).toEqual([]);
  });

  it("ignores a project touched on only one day", () => {
    const spans = [span("dsa", "10-05", 40), span("dsa", "10-05", 60)];
    expect(findRevisitNudges(spans, [dsa], NOW, "UTC")).toEqual([]);
  });

  it("ignores days outside the week before the last session", () => {
    const spans = [span("dsa", "09-20", 40), span("dsa", "10-05", 60)];
    expect(findRevisitNudges(spans, [dsa], NOW, "UTC")).toEqual([]);
  });

  it("stops nudging once the gap passes two weeks", () => {
    const spans = [span("dsa", "09-23", 40), span("dsa", "09-24", 60)];
    expect(findRevisitNudges(spans, [dsa], NOW, "UTC")).toEqual([]);
  });

  it("ignores archived projects", () => {
    const spans = [span("dsa", "10-05", 40), span("dsa", "10-06", 60)];
    const archived = { ...dsa, archived: true };
    expect(findRevisitNudges(spans, [archived], NOW, "UTC")).toEqual([]);
  });

  it("leaves paused time out of the run's total", () => {
    const spans = [
      span("dsa", "10-05", 40),
      { ...span("dsa", "10-06", 60), pausedSeconds: 600 },
    ];
    const [nudge] = findRevisitNudges(spans, [dsa], NOW, "UTC");
    expect(nudge.workedSeconds).toBe(5400);
  });

  it("counts days in the user's timezone", () => {
    // 20:00 UTC on Oct 5 and 6 is already Oct 6 and 7 in Kolkata, so the gap
    // there is only two days.
    const spans = [
      { ...span("dsa", "10-05", 40), startedAt: "2026-10-05T20:00:00Z" },
      { ...span("dsa", "10-06", 40), startedAt: "2026-10-06T20:00:00Z" },
    ];
    expect(findRevisitNudges(spans, [dsa], NOW, "UTC")).toHaveLength(1);
    expect(findRevisitNudges(spans, [dsa], NOW, "Asia/Kolkata")).toEqual([]);
  });

  it("puts the most recently lapsed project first", () => {
    const song = { id: "song", name: "Song #1", archived: false };
    const spans = [
      span("song", "10-01", 30),
      span("song", "10-02", 30),
      span("dsa", "10-05", 40),
      span("dsa", "10-06", 60),
    ];
    const names = findRevisitNudges(spans, [song, dsa], NOW, "UTC").map(
      (nudge) => nudge.projectName,
    );
    expect(names).toEqual(["DSA", "Song #1"]);
  });
});
