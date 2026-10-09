import { isUuid } from "@/lib/uuid";

export const MAX_PROJECT_NAME_LENGTH = 80;

export type ProjectNameResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

export function parseProjectName(formData: FormData): ProjectNameResult {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    return { ok: false, error: "Enter a project name." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length > MAX_PROJECT_NAME_LENGTH) {
    return {
      ok: false,
      error: `Keep the name to ${MAX_PROJECT_NAME_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, name: trimmedName };
}

export type ProjectGoalResult =
  | { ok: true; goalId: string | null }
  | { ok: false; error: string };

/** An empty value unlinks the project from its goal. */
export function parseProjectGoal(formData: FormData): ProjectGoalResult {
  const goalId = formData.get("goalId");
  if (goalId === null || goalId === "") return { ok: true, goalId: null };
  if (!isUuid(goalId)) return { ok: false, error: "Choose a valid goal." };
  return { ok: true, goalId };
}
