import { listCategories } from "@/features/categories/queries";
import { listGoals } from "@/features/goals/queries";
import { listProjects } from "@/features/projects/queries";
import { listSessionSpans } from "@/features/sessions/queries";
import { periodStats, type Period } from "./periods";

/**
 * Stats for the given periods, oldest first, and what they were computed
 * from. The review page and the report writer both start here.
 */
export async function loadPeriodData(periods: Period[], timeZone: string) {
  const [goals, projects, categories, spans] = await Promise.all([
    listGoals(),
    listProjects(),
    listCategories(),
    listSessionSpans(periods[0].start),
  ]);

  const activeGoalIds = new Set(
    goals.filter((g) => !g.archived).map((g) => g.id),
  );
  // Archived projects still count: their time went where it went.
  const servingProjectIds = new Set(
    projects
      .filter((p) => p.goalId !== null && activeGoalIds.has(p.goalId))
      .map((p) => p.id),
  );

  return {
    stats: periodStats(
      periods,
      spans,
      new Map(categories.map((c) => [c.id, c.kind])),
      servingProjectIds,
      timeZone,
    ),
    goals,
    projects,
    categories,
    spans,
  };
}
