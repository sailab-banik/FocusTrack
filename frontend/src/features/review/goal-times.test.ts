import { describe, expect, it } from "vitest";
import { goalTimes, NO_GOAL_LABEL } from "./goal-times";

const categories = [
  { id: "build", name: "Build", kind: "execution" as const },
  { id: "learn", name: "Learn", kind: "preparation" as const },
];
const goals = [
  { id: "g1", title: "Ship software", description: null, archived: false },
  { id: "g2", title: "Make music", description: null, archived: false },
  { id: "g3", title: "Old", description: null, archived: true },
];
const projects = [
  { id: "app", name: "App", archived: false, goalId: "g1" },
  { id: "done", name: "Done", archived: true, goalId: "g1" },
  { id: "side", name: "Side", archived: false, goalId: null },
  { id: "legacy", name: "Legacy", archived: false, goalId: "g3" },
];

function span(projectId: string, categoryId: string, minutes: number) {
  return {
    projectId,
    categoryId,
    startedAt: "2026-10-13T09:00:00Z",
    endedAt: new Date(
      Date.parse("2026-10-13T09:00:00Z") + minutes * 60_000,
    ).toISOString(),
    pausedSeconds: 0,
  };
}

describe("goalTimes", () => {
  it("sums each active goal's projects, archived ones included", () => {
    const rows = goalTimes(
      [span("app", "build", 60), span("done", "learn", 30)],
      categories,
      goals,
      projects,
    );
    expect(rows).toEqual([
      {
        label: "Ship software",
        time: { execution: 3600, preparation: 1800 },
        servesGoal: true,
      },
      {
        label: "Make music",
        time: { execution: 0, preparation: 0 },
        servesGoal: true,
      },
    ]);
  });

  it("adds unlinked time, counting archived goals as none", () => {
    const rows = goalTimes(
      [span("side", "learn", 30), span("legacy", "build", 15)],
      categories,
      goals,
      projects,
    );
    expect(rows.at(-1)).toEqual({
      label: NO_GOAL_LABEL,
      time: { execution: 900, preparation: 1800 },
      servesGoal: false,
    });
  });
});
