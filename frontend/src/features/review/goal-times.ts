import type { Category } from "@/features/categories/queries";
import type { Goal } from "@/features/goals/queries";
import type { Project } from "@/features/projects/queries";
import type { SessionSpan } from "@/features/sessions/queries";
import {
  allocate,
  NO_TIME,
  sumTime,
  totalSeconds,
  type KindSeconds,
} from "@/features/work/allocation";

export type GoalTime = { label: string; time: KindSeconds; servesGoal: boolean };

export const NO_GOAL_LABEL = "Not serving a goal";

/**
 * Time per active goal, goals with none included so neglect shows, then the
 * time that served no goal when there is any.
 */
export function goalTimes(
  spans: Omit<SessionSpan, "id">[],
  categories: Category[],
  goals: Goal[],
  projects: Project[],
): GoalTime[] {
  const { byProject } = allocate(spans, categories);
  const activeGoals = goals.filter((g) => !g.archived);
  const activeGoalIds = new Set(activeGoals.map((g) => g.id));
  const timeOf = (list: Project[]) =>
    sumTime(list.map((p) => byProject.get(p.id) ?? NO_TIME));

  const rows: GoalTime[] = activeGoals.map((goal) => ({
    label: goal.title,
    time: timeOf(projects.filter((p) => p.goalId === goal.id)),
    servesGoal: true,
  }));
  const unlinked = timeOf(
    projects.filter((p) => p.goalId === null || !activeGoalIds.has(p.goalId)),
  );
  if (totalSeconds(unlinked) > 0) {
    rows.push({ label: NO_GOAL_LABEL, time: unlinked, servesGoal: false });
  }
  return rows;
}
