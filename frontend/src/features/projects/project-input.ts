export const MAX_PROJECT_NAME_LENGTH = 80;
export const MAX_PROJECT_WHY_LENGTH = 120;

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

export type ProjectWhyResult =
  | { ok: true; why: string | null }
  | { ok: false; error: string };

/** A blank value means the project has no reason set. */
export function parseProjectWhy(formData: FormData): ProjectWhyResult {
  const why = formData.get("why");
  const trimmed = typeof why === "string" ? why.trim() : "";
  if (trimmed.length > MAX_PROJECT_WHY_LENGTH) {
    return {
      ok: false,
      error: `Keep the reason to ${MAX_PROJECT_WHY_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, why: trimmed === "" ? null : trimmed };
}
