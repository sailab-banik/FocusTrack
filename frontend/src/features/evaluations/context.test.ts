import { describe, expect, it } from "vitest";
import { buildEvaluationContext, type SessionFacts } from "./context";

const categories = [
  { id: "build", name: "Build", kind: "execution" as const },
  { id: "plan", name: "Brainstorm", kind: "preparation" as const },
];

function prior(
  startedAt: string,
  minutes: number,
  categoryId: string,
  outcome: string,
): SessionFacts {
  const endedAt = new Date(new Date(startedAt).getTime() + minutes * 60_000);
  return {
    startedAt,
    endedAt: endedAt.toISOString(),
    categoryId,
    description: "work",
    outcome,
  };
}

const session = {
  ...prior("2026-10-09T10:00:00Z", 35, "build", "Shipped the form"),
  description: "Built the form",
  energy: 4,
  difficulty: null,
  notes: null,
};

describe("buildEvaluationContext", () => {
  const context = buildEvaluationContext({
    session,
    projectName: "FocusTrack",
    goal: { title: "Become a stronger engineer", description: null },
    categories,
    priorSessions: [
      prior("2026-10-08T09:00:00Z", 140, "plan", "Outlined the plan"),
      prior("2026-10-06T09:00:00Z", 60, "build", "Scaffolded the app"),
    ],
  });

  it("describes the session with names, kind, and duration", () => {
    expect(context.session).toEqual({
      project: "FocusTrack",
      category: "Build",
      categoryKind: "execution",
      durationMinutes: 35,
      description: "Built the form",
      outcome: "Shipped the form",
      energy: 4,
      difficulty: null,
      notes: null,
    });
  });

  it("splits prior project time into execution and preparation", () => {
    expect(context.projectLast14Days).toEqual({
      sessionCount: 2,
      executionMinutes: 60,
      preparationMinutes: 140,
    });
  });

  it("lists recent sessions with whole days before this one", () => {
    expect(context.recentProjectSessions).toEqual([
      {
        daysBefore: 1,
        category: "Brainstorm",
        categoryKind: "preparation",
        durationMinutes: 140,
        outcome: "Outlined the plan",
      },
      {
        daysBefore: 3,
        category: "Build",
        categoryKind: "execution",
        durationMinutes: 60,
        outcome: "Scaffolded the app",
      },
    ]);
  });

  it("caps the recent session list at 8", () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      prior(`2026-10-0${(i % 8) + 1}T09:00:00Z`, 30, "build", "x"),
    );
    const capped = buildEvaluationContext({
      session,
      projectName: "FocusTrack",
      goal: null,
      categories,
      priorSessions: many,
    });
    expect(capped.recentProjectSessions).toHaveLength(8);
    expect(capped.projectLast14Days.sessionCount).toBe(12);
  });
});
