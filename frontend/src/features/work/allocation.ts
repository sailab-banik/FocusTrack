import type { Category } from "@/features/categories/queries";
import { sessionSeconds } from "@/features/sessions/duration";

export const WINDOW_DAYS = 28;

export type KindSeconds = { execution: number; preparation: number };

export const NO_TIME: KindSeconds = { execution: 0, preparation: 0 };

type Span = {
  projectId: string;
  categoryId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
};

export type Allocation = {
  byProject: Map<string, KindSeconds>;
  byCategory: Map<string, number>;
};

/** Worked time per project, split by kind, and per category. */
export function allocate(spans: Span[], categories: Category[]): Allocation {
  const kinds = new Map(categories.map((c) => [c.id, c.kind]));
  const byProject = new Map<string, KindSeconds>();
  const byCategory = new Map<string, number>();

  for (const span of spans) {
    const seconds = sessionSeconds(span);
    // A category with sessions cannot be removed.
    const kind = kinds.get(span.categoryId)!;
    const project = byProject.get(span.projectId) ?? { ...NO_TIME };
    project[kind] += seconds;
    byProject.set(span.projectId, project);
    byCategory.set(
      span.categoryId,
      (byCategory.get(span.categoryId) ?? 0) + seconds,
    );
  }
  return { byProject, byCategory };
}

export function totalSeconds(time: KindSeconds): number {
  return time.execution + time.preparation;
}

export function sumTime(times: KindSeconds[]): KindSeconds {
  return times.reduce(
    (sum, time) => ({
      execution: sum.execution + time.execution,
      preparation: sum.preparation + time.preparation,
    }),
    NO_TIME,
  );
}

/** Whole-number percentage of `part` in `whole`; 0 when there is no whole. */
export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

/**
 * All time tracked, and the part of it on projects linked to an active goal.
 * Archived projects count: their time still went where it went.
 */
export function goalAlignment(
  byProject: Map<string, KindSeconds>,
  projects: { id: string; goalId: string | null }[],
  activeGoalIds: Set<string>,
): { trackedSeconds: number; servingSeconds: number } {
  const goalOf = new Map(projects.map((p) => [p.id, p.goalId]));
  let trackedSeconds = 0;
  let servingSeconds = 0;
  for (const [projectId, time] of byProject) {
    const seconds = totalSeconds(time);
    trackedSeconds += seconds;
    const goalId = goalOf.get(projectId);
    if (goalId && activeGoalIds.has(goalId)) servingSeconds += seconds;
  }
  return { trackedSeconds, servingSeconds };
}
