import { listCategories } from "@/features/categories/queries";
import { listGoals } from "@/features/goals/queries";
import { listProjects } from "@/features/projects/queries";
import { listSessionSpans } from "@/features/sessions/queries";
import { localDayKey } from "@/features/timezone/zoned-time";
import { isoWeekday, recentWeeks, weekStats } from "./weeks";

export const PREVIOUS_WEEKS = 4;

/** Everything the review page and the review writer both start from. */
export async function loadWeekData(now: Date, timeZone: string) {
  const weeks = recentWeeks(now, timeZone, PREVIOUS_WEEKS);
  const [goals, projects, categories, spans] = await Promise.all([
    listGoals(),
    listProjects(),
    listCategories(),
    listSessionSpans(weeks[0].start),
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
  const currentWeek = weeks.at(-1)!;

  return {
    weeks,
    currentWeek,
    daysCovered: isoWeekday(localDayKey(now, timeZone)),
    stats: weekStats(
      weeks,
      spans,
      new Map(categories.map((c) => [c.id, c.kind])),
      servingProjectIds,
      timeZone,
    ),
    goals,
    projects,
    categories,
    thisWeekSpans: spans.filter(
      (span) => new Date(span.startedAt) >= currentWeek.start,
    ),
  };
}
