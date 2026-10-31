import { describe, expect, it } from "vitest";
import { buildReportContext, SESSION_LIMIT } from "./context";

const categories = [
  { id: "build", name: "Build", kind: "execution" as const },
  { id: "learn", name: "Learn", kind: "preparation" as const },
];
const projects = [
  { id: "app", name: "App", archived: false, why: "Ship software" },
  { id: "side", name: "Side", archived: false, why: null },
  { id: "legacy", name: "Legacy", archived: false, why: null },
  { id: "gone", name: "Gone", archived: true, why: "Ship software" },
];
const stats = [
  {
    startKey: "2026-10-05",
    totalSeconds: 36000,
    executionSeconds: 9000,
    servingSeconds: 18000,
    sessionCount: 8,
    activeDays: 5,
  },
  {
    startKey: "2026-10-12",
    totalSeconds: 5400,
    executionSeconds: 3600,
    servingSeconds: 3600,
    sessionCount: 2,
    activeDays: 1,
  },
];

function session(projectId: string, categoryId: string, outcome: string) {
  return {
    projectId,
    categoryId,
    startedAt: "2026-10-13T09:00:00Z",
    endedAt: "2026-10-13T10:00:00Z",
    pausedSeconds: 0,
    outcome,
  };
}

function build(
  sessions = [session("app", "build", "Shipped")],
  timeZone = "UTC",
) {
  return buildReportContext({
    kind: "week",
    stats,
    projects,
    categories,
    sessions,
    timeZone,
  });
}

describe("buildReportContext", () => {
  it("summarizes the reported period in minutes", () => {
    expect(build().period).toEqual({
      kind: "week",
      startDate: "2026-10-12",
      totalMinutes: 90,
      executionMinutes: 60,
      preparationMinutes: 30,
      minutesOnGoals: 60,
      sessionCount: 2,
      activeDays: 1,
    });
  });

  it("reduces previous periods to shares", () => {
    expect(build().previousPeriods).toEqual([
      {
        startDate: "2026-10-05",
        totalMinutes: 600,
        executionPercent: 25,
        goalPercent: 50,
        sessionCount: 8,
        activeDays: 5,
      },
    ]);
  });

  it("lists active projects with why each matters", () => {
    expect(build().projects).toEqual([
      {
        name: "App",
        why: "Ship software",
        executionMinutes: 60,
        preparationMinutes: 0,
      },
      expect.objectContaining({ name: "Side", why: null }),
      expect.objectContaining({ name: "Legacy", why: null }),
    ]);
  });

  it("lists sessions with date, start time, kind, and outcome", () => {
    expect(build().sessions).toEqual([
      {
        date: "2026-10-13",
        weekday: "Tue",
        startTime: "09:00",
        project: "App",
        category: "Build",
        categoryKind: "execution",
        minutes: 60,
        outcome: "Shipped",
      },
    ]);
  });

  it("dates sessions in the user's timezone", () => {
    const late = {
      ...session("app", "build", "Shipped"),
      startedAt: "2026-10-13T20:00:00Z",
      endedAt: "2026-10-13T21:00:00Z",
    };
    const [listed] = build([late], "Asia/Kolkata").sessions;
    expect(listed).toMatchObject({
      date: "2026-10-14",
      weekday: "Wed",
      startTime: "01:30",
    });
  });

  it("caps the session list and long outcomes", () => {
    const many = Array.from({ length: SESSION_LIMIT + 5 }, () =>
      session("side", "learn", "x".repeat(500)),
    );
    const context = build(many);
    expect(context.sessions).toHaveLength(SESSION_LIMIT);
    expect(context.sessions[0].outcome).toHaveLength(200);
  });
});
