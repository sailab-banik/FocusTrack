export const GOAL_LIMITS = { title: 120, description: 1000 };

export type GoalInput = { title: string; description: string | null };

export type GoalInputResult =
  | { ok: true; input: GoalInput }
  | { ok: false; error: string };

export function parseGoalInput(formData: FormData): GoalInputResult {
  const title = formData.get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "Enter a goal." };
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle.length > GOAL_LIMITS.title) {
    return {
      ok: false,
      error: `Keep the goal to ${GOAL_LIMITS.title} characters or fewer.`,
    };
  }

  const description = formData.get("description");
  const trimmedDescription =
    typeof description === "string" ? description.trim() : "";
  if (trimmedDescription.length > GOAL_LIMITS.description) {
    return {
      ok: false,
      error: `Keep the description to ${GOAL_LIMITS.description} characters or fewer.`,
    };
  }

  return {
    ok: true,
    input: {
      title: trimmedTitle,
      description: trimmedDescription === "" ? null : trimmedDescription,
    },
  };
}
