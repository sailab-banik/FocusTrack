import type { CategoryKind } from "@/features/categories/category-input";
import type { Category } from "@/features/categories/queries";
import type { Goal } from "@/features/goals/queries";
import type { Project } from "@/features/projects/queries";
import { sessionSeconds } from "@/features/sessions/duration";
import { localDayKey } from "@/features/timezone/zoned-time";
import { allocate, NO_TIME, percent } from "@/features/work/allocation";
import { isoWeekday, type WeekStats } from "./weeks";

export type WeekSession = {
  projectId: string;
  categoryId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
  outcome: string | null;
  aiOverall: number | null;
};

type ProjectMinutes = {
  name: string;
  executionMinutes: number;
  preparationMinutes: number;
};

/**
 * What the model sees. Deliberately minimal: aggregates, goal and project
 * names, and this week's outcomes. No notes, descriptions, or account details.
 */
export type ReviewContext = {
  currentWeek: {
    startDate: string;
    daysCovered: number;
    totalMinutes: number;
    executionMinutes: number;
    preparationMinutes: number;
    minutesOnGoals: number;
    sessionCount: number;
    activeDays: number;
  };
  previousWeeks: {
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
  sessionsThisWeek: {
    weekday: string;
    project: string;
    category: string;
    categoryKind: CategoryKind;
    minutes: number;
    outcome: string | null;
    aiOverall: number | null;
  }[];
};

export const SESSION_LIMIT = 40;
const OUTCOME_LIMIT = 200;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function minutes(seconds: number): number {
  return Math.round(seconds / 60);
}

export function buildReviewContext(input: {
  /** Oldest first; the last entry is the current week. */
  stats: WeekStats[];
  daysCovered: number;
  goals: Goal[];
  projects: Project[];
  categories: Category[];
  /** This week's sessions, newest first. */
  sessions: WeekSession[];
  timeZone: string;
}): ReviewContext {
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
    currentWeek: {
      startDate: current.startKey,
      daysCovered: input.daysCovered,
      totalMinutes: minutes(current.totalSeconds),
      executionMinutes: minutes(current.executionSeconds),
      preparationMinutes: minutes(
        current.totalSeconds - current.executionSeconds,
      ),
      minutesOnGoals: minutes(current.servingSeconds),
      sessionCount: current.sessionCount,
      activeDays: current.activeDays,
    },
    previousWeeks: input.stats.slice(0, -1).map((week) => ({
      startDate: week.startKey,
      totalMinutes: minutes(week.totalSeconds),
      executionPercent: percent(week.executionSeconds, week.totalSeconds),
      goalPercent: percent(week.servingSeconds, week.totalSeconds),
      sessionCount: week.sessionCount,
      activeDays: week.activeDays,
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
    sessionsThisWeek: input.sessions.slice(0, SESSION_LIMIT).map((session) => {
      // A category with sessions cannot be removed.
      const category = categoryById.get(session.categoryId)!;
      return {
        weekday:
          WEEKDAYS[
            isoWeekday(localDayKey(new Date(session.startedAt), input.timeZone)) - 1
          ],
        project: projectName.get(session.projectId) ?? "",
        category: category.name,
        categoryKind: category.kind,
        minutes: minutes(sessionSeconds(session)),
        outcome: session.outcome?.slice(0, OUTCOME_LIMIT) ?? null,
        aiOverall: session.aiOverall,
      };
    }),
  };
}
