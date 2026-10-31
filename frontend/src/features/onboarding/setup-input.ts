import {
  parseProjectName,
  parseProjectWhy,
} from "@/features/projects/project-input";

export type SetupInput = {
  projectName: string;
  why: string | null;
};

export type SetupInputResult =
  | { ok: true; input: SetupInput }
  | { ok: false; error: string };

export function parseSetupInput(formData: FormData): SetupInputResult {
  const name = parseProjectName(formData);
  if (!name.ok) return { ok: false, error: name.error };

  const why = parseProjectWhy(formData);
  if (!why.ok) return { ok: false, error: why.error };

  return {
    ok: true,
    input: {
      projectName: name.name,
      why: why.why,
    },
  };
}
