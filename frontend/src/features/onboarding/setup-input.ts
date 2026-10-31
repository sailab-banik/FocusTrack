import {
  parseProjectName,
  parseProjectWhy,
} from "@/features/projects/project-input";
import { isUuid } from "@/lib/uuid";

export type SetupInput = {
  projectName: string;
  why: string | null;
  executionIds: string[];
  preparationIds: string[];
};

export type SetupInputResult =
  | { ok: true; input: SetupInput }
  | { ok: false; error: string };

export function parseSetupInput(formData: FormData): SetupInputResult {
  const name = parseProjectName(formData);
  if (!name.ok) return { ok: false, error: name.error };

  const why = parseProjectWhy(formData);
  if (!why.ok) return { ok: false, error: why.error };

  const executionIds = formData.getAll("execution");
  const preparationIds = formData.getAll("preparation");
  if (!executionIds.every(isUuid) || !preparationIds.every(isUuid)) {
    return { ok: false, error: "Reload the page and try again." };
  }

  return {
    ok: true,
    input: {
      projectName: name.name,
      why: why.why,
      executionIds,
      preparationIds,
    },
  };
}
