import { isUuid } from "@/lib/uuid";

export type StartInput = { projectId: string; categoryId: string };

export type StartInputResult =
  | { ok: true; input: StartInput }
  | { ok: false; error: string };

export function parseStartInput(formData: FormData): StartInputResult {
  const projectId = formData.get("projectId");
  const categoryId = formData.get("categoryId");
  if (!isUuid(projectId)) {
    return { ok: false, error: "Choose a project." };
  }
  if (!isUuid(categoryId)) {
    return { ok: false, error: "Choose a category." };
  }
  return { ok: true, input: { projectId, categoryId } };
}
