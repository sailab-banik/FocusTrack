import { describe, expect, it } from "vitest";
import type { Category } from "@/features/categories/queries";
import {
  allocate,
  goalAlignment,
  percent,
  sumTime,
  totalSeconds,
} from "./allocation";

const categories: Category[] = [
  { id: "build", name: "Build", kind: "execution" },
  { id: "learn", name: "Learn", kind: "preparation" },
];

function span(
  projectId: string,
  categoryId: string,
  minutes: number,
  pausedSeconds = 0,
) {
  const startedAt = new Date("2026-10-05T09:00:00Z");
  const endedAt = new Date(startedAt.getTime() + minutes * 60_000);
  return {
    projectId,
    categoryId,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    pausedSeconds,
  };
}

describe("allocate", () => {
  it("splits each project's worked time by its categories' kinds", () => {
    const { byProject } = allocate(
      [
        span("app", "build", 60),
        span("app", "learn", 30),
        span("song", "build", 10),
      ],
      categories,
    );
    expect(byProject.get("app")).toEqual({
      execution: 3600,
      preparation: 1800,
    });
    expect(byProject.get("song")).toEqual({ execution: 600, preparation: 0 });
  });

  it("totals worked time per category, leaving out pauses", () => {
    const { byCategory } = allocate(
      [span("app", "build", 60, 600), span("song", "build", 10)],
      categories,
    );
    expect(byCategory.get("build")).toBe(3600);
    expect(byCategory.has("learn")).toBe(false);
  });

  it("returns empty maps when nothing was tracked", () => {
    const { byProject, byCategory } = allocate([], categories);
    expect(byProject.size).toBe(0);
    expect(byCategory.size).toBe(0);
  });
});

describe("sumTime", () => {
  it("adds execution and preparation separately", () => {
    const sum = sumTime([
      { execution: 100, preparation: 20 },
      { execution: 50, preparation: 5 },
    ]);
    expect(sum).toEqual({ execution: 150, preparation: 25 });
    expect(totalSeconds(sum)).toBe(175);
  });

  it("is zero for no projects", () => {
    expect(sumTime([])).toEqual({ execution: 0, preparation: 0 });
  });
});

describe("percent", () => {
  it("rounds to a whole percentage", () => {
    expect(percent(2, 3)).toBe(67);
  });

  it("is 0 when the whole is 0", () => {
    expect(percent(0, 0)).toBe(0);
  });
});

describe("goalAlignment", () => {
  const byProject = new Map([
    ["app", { execution: 3000, preparation: 600 }],
    ["side", { execution: 0, preparation: 1200 }],
    ["old", { execution: 600, preparation: 0 }],
  ]);

  it("counts time on projects linked to an active goal as serving one", () => {
    expect(
      goalAlignment(
        byProject,
        [
          { id: "app", goalId: "engineer" },
          { id: "side", goalId: null },
          { id: "old", goalId: "retired" },
        ],
        new Set(["engineer"]),
      ),
    ).toEqual({ trackedSeconds: 5400, servingSeconds: 3600 });
  });

  it("is zero when nothing was tracked", () => {
    expect(goalAlignment(new Map(), [], new Set())).toEqual({
      trackedSeconds: 0,
      servingSeconds: 0,
    });
  });
});
