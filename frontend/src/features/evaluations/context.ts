import type { CategoryKind } from "@/features/categories/category-input";
import { sessionSeconds } from "@/features/sessions/duration";

export type SessionFacts = {
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
  categoryId: string;
  description: string | null;
  outcome: string | null;
};

type CategoryFacts = { id: string; name: string; kind: CategoryKind };

/**
 * What the model sees. Deliberately minimal: only the facts needed to judge
 * this session, with no account details.
 */
export type EvaluationContext = {
  session: {
    project: string;
    category: string;
    categoryKind: CategoryKind;
    durationMinutes: number;
    description: string;
    outcome: string;
    energy: number | null;
    difficulty: number | null;
    notes: string | null;
  };
  goal: { title: string; description: string | null } | null;
  projectLast14Days: {
    sessionCount: number;
    executionMinutes: number;
    preparationMinutes: number;
  };
  recentProjectSessions: {
    daysBefore: number;
    category: string;
    categoryKind: CategoryKind;
    durationMinutes: number;
    outcome: string | null;
  }[];
};

export const RECENT_SESSION_LIMIT = 8;
export const HISTORY_WINDOW_DAYS = 14;

export function buildEvaluationContext(input: {
  session: SessionFacts & {
    energy: number | null;
    difficulty: number | null;
    notes: string | null;
  };
  projectName: string;
  goal: { title: string; description: string | null } | null;
  categories: CategoryFacts[];
  /** Earlier sessions on the same project, newest first. */
  priorSessions: SessionFacts[];
}): EvaluationContext {
  const categoryById = new Map(input.categories.map((c) => [c.id, c]));
  const category = (id: string) => {
    const found = categoryById.get(id);
    if (!found) throw new Error(`Unknown category ${id}`);
    return found;
  };

  const { session } = input;
  const sessionCategory = category(session.categoryId);
  const sessionStart = new Date(session.startedAt).getTime();

  let executionMinutes = 0;
  let preparationMinutes = 0;
  for (const prior of input.priorSessions) {
    const minutes = durationMinutes(prior);
    if (category(prior.categoryId).kind === "execution") {
      executionMinutes += minutes;
    } else {
      preparationMinutes += minutes;
    }
  }

  return {
    session: {
      project: input.projectName,
      category: sessionCategory.name,
      categoryKind: sessionCategory.kind,
      durationMinutes: durationMinutes(session),
      // Evaluation only runs on logged sessions.
      description: session.description ?? "",
      outcome: session.outcome ?? "",
      energy: session.energy,
      difficulty: session.difficulty,
      notes: session.notes,
    },
    goal: input.goal,
    projectLast14Days: {
      sessionCount: input.priorSessions.length,
      executionMinutes,
      preparationMinutes,
    },
    recentProjectSessions: input.priorSessions
      .slice(0, RECENT_SESSION_LIMIT)
      .map((prior) => {
        const priorCategory = category(prior.categoryId);
        return {
          daysBefore: Math.floor(
            (sessionStart - new Date(prior.startedAt).getTime()) / 86_400_000,
          ),
          category: priorCategory.name,
          categoryKind: priorCategory.kind,
          durationMinutes: durationMinutes(prior),
          outcome: prior.outcome,
        };
      }),
  };
}

function durationMinutes(session: SessionFacts) {
  return Math.round(sessionSeconds(session) / 60);
}
