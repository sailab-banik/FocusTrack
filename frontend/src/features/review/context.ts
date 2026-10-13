import type { CategoryKind } from "@/features/categories/category-input";
import type { Category } from "@/features/categories/queries";
import type { Goal } from "@/features/goals/queries";
import type { Project } from "@/features/projects/queries";
import { sessionSeconds } from "@/features/sessions/duration";
import { formatLocalTime, localDayKey } from "@/features/timezone/zoned-time";
import { allocate, NO_TIME, percent } from "@/features/work/allocation";
import { isoWeekday, type PeriodKind, type PeriodStats } from "./periods";

export type PeriodSession = {
  projectId: string;
  categoryId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
  outcome: string | null;
};

type ProjectMinutes = {
  name: string;
  executionMinutes: number;
  preparationMinutes: number;
};

/**
 * What the model sees. Deliberately minimal: aggregates, goal and project
 * names, and the period's outcomes. No notes, descriptions, or account details.
 */
export type ReportContext = {
  period: {
    kind: PeriodKind;
    startDate: string;
    totalMinutes: number;
    executionMinutes: number;
    preparationMinutes: number;
    minutesOnGoals: number;
    sessionCount: number;
    activeDays: number;
  };
  previousPeriods: {
    startDate: string;
    totalMinutes: number;
    executionPercent: number;
    goalPercent: number;
    sessionCount: number;
    activeDays: number;
  }[];
  goals: {
    title: string;
    description: string | null;
    projects: ProjectMinutes[];
  }[];
  projectsServingNoGoal: ProjectMinutes[];
  sessions: {
    date: string;
    weekday: string;
    startTime: string;
    project: string;
    category: string;
    categoryKind: CategoryKind;
    minutes: number;
    outcome: string | null;
  }[];
};

export const SESSION_LIMIT = 60;
const OUTCOME_LIMIT = 200;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function minutes(seconds: number): number {
  return Math.round(seconds / 60);
}

export function buildReportContext(input: {
  kind: PeriodKind;
  /** Oldest first; the last entry is the period being reported on. */
  stats: PeriodStats[];
  goals: Goal[];
  projects: Project[];
  categories: Category[];
  /** The period's sessions, newest first. */
  sessions: PeriodSession[];
  timeZone: string;
}): ReportContext {
  const current = input.stats.at(-1)!;
  const activeGoals = input.goals.filter((g) => !g.archived);
  const activeGoalIds = new Set(activeGoals.map((g) => g.id));
  const activeProjects = input.projects.filter((p) => !p.archived);
  const projectName = new Map(input.projects.map((p) => [p.id, p.name]));
  const categoryById = new Map(input.categories.map((c) => [c.id, c]));
  const { byProject } = allocate(input.sessions, input.categories);

  const projectMinutes = (project: Project): ProjectMinutes => {
    const time = byProject.get(project.id) ?? NO_TIME;
    return {
      name: project.name,
      executionMinutes: minutes(time.execution),
      preparationMinutes: minutes(time.preparation),
    };
  };

  return {
    period: {
      kind: input.kind,
      startDate: current.startKey,
      totalMinutes: minutes(current.totalSeconds),
      executionMinutes: minutes(current.executionSeconds),
      preparationMinutes: minutes(
        current.totalSeconds - current.executionSeconds,
      ),
      minutesOnGoals: minutes(current.servingSeconds),
      sessionCount: current.sessionCount,
      activeDays: current.activeDays,
    },
    previousPeriods: input.stats.slice(0, -1).map((period) => ({
      startDate: period.startKey,
      totalMinutes: minutes(period.totalSeconds),
      executionPercent: percent(period.executionSeconds, period.totalSeconds),
      goalPercent: percent(period.servingSeconds, period.totalSeconds),
      sessionCount: period.sessionCount,
      activeDays: period.activeDays,
    })),
    goals: activeGoals.map((goal) => ({
      title: goal.title,
      description: goal.description,
      projects: activeProjects
        .filter((p) => p.goalId === goal.id)
        .map(projectMinutes),
    })),
    projectsServingNoGoal: activeProjects
      .filter((p) => p.goalId === null || !activeGoalIds.has(p.goalId))
      .map(projectMinutes),
    sessions: input.sessions.slice(0, SESSION_LIMIT).map((session) => {
      // A category with sessions cannot be removed.
      const category = categoryById.get(session.categoryId)!;
      const startedAt = new Date(session.startedAt);
      const date = localDayKey(startedAt, input.timeZone);
      return {
        date,
        weekday: WEEKDAYS[isoWeekday(date) - 1],
        startTime: formatLocalTime(startedAt, input.timeZone),
        project: projectName.get(session.projectId) ?? "",
        category: category.name,
        categoryKind: category.kind,
        minutes: minutes(sessionSeconds(session)),
        outcome: session.outcome?.slice(0, OUTCOME_LIMIT) ?? null,
      };
    }),
  };
}
