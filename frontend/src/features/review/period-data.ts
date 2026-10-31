import { listCategories } from "@/features/categories/queries";
import { listProjects } from "@/features/projects/queries";
import { listSessionSpans } from "@/features/sessions/queries";
import { periodStats, type Period } from "./periods";

/**
 * Stats for the given periods, oldest first, and what they were computed
 * from. The review page and the report writer both start here.
 */
export async function loadPeriodData(periods: Period[], timeZone: string) {
  const [projects, categories, spans] = await Promise.all([
    listProjects(),
    listCategories(),
    listSessionSpans(periods[0].start),
  ]);

  // Archived projects still count: their time went where it went.
  const servingProjectIds = new Set(
    projects.filter((p) => p.why).map((p) => p.id),
  );

  return {
    stats: periodStats(
      periods,
      spans,
      new Map(categories.map((c) => [c.id, c.kind])),
      servingProjectIds,
      timeZone,
    ),
    projects,
    categories,
    spans,
  };
}
