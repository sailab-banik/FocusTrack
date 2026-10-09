import type { Enums } from "@/lib/supabase/database.types";

export type CategoryKind = Enums<"category_kind">;

export const CATEGORY_KINDS = ["execution", "preparation"] as const satisfies
  readonly CategoryKind[];

export const MAX_CATEGORY_NAME_LENGTH = 40;

export type CategoryInput = { name: string; kind: CategoryKind };

export type CategoryInputResult =
  | { ok: true; input: CategoryInput }
  | { ok: false; error: string };

export function parseCategoryInput(formData: FormData): CategoryInputResult {
  const name = formData.get("name");
  const kind = formData.get("kind");
  if (typeof name !== "string" || typeof kind !== "string") {
    return { ok: false, error: "Name and kind are required." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { ok: false, error: "Enter a category name." };
  }
  if (trimmedName.length > MAX_CATEGORY_NAME_LENGTH) {
    return {
      ok: false,
      error: `Keep the name to ${MAX_CATEGORY_NAME_LENGTH} characters or fewer.`,
    };
  }
  if (!isCategoryKind(kind)) {
    return { ok: false, error: "Choose execution or preparation." };
  }

  return { ok: true, input: { name: trimmedName, kind } };
}

function isCategoryKind(value: string): value is CategoryKind {
  return (CATEGORY_KINDS as readonly string[]).includes(value);
}
