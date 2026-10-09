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
