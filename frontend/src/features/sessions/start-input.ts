export type StartInput = { projectId: string; categoryId: string };

export type StartInputResult =
  | { ok: true; input: StartInput }
  | { ok: false; error: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseStartInput(formData: FormData): StartInputResult {
  const projectId = formData.get("projectId");
  const categoryId = formData.get("categoryId");
  if (typeof projectId !== "string" || !UUID_PATTERN.test(projectId)) {
    return { ok: false, error: "Choose a project." };
  }
  if (typeof categoryId !== "string" || !UUID_PATTERN.test(categoryId)) {
    return { ok: false, error: "Choose a category." };
  }
  return { ok: true, input: { projectId, categoryId } };
}
