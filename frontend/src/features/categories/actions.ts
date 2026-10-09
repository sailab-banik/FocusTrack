"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { parseCategoryInput, type CategoryInput } from "./category-input";

export type CategoryFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

// user_id is never sent: the column defaults to auth.uid() and RLS rejects
// rows that belong to anyone else.
export async function createCategory(
  _state: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireUser();
  const parsed = parseCategoryInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.input);
  return finish(error, parsed.input);
}

export async function updateCategory(
  _state: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string") {
    return { status: "error", message: "Missing category." };
  }
  const parsed = parseCategoryInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.input)
    .eq("id", id);
  return finish(error, parsed.input);
}

export async function deleteCategory(id: string): Promise<CategoryFormState> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return {
      status: "error",
      message:
        "This category has sessions, so it can't be removed. Rename it instead.",
    };
  }
  if (error) throw error;
  refresh();
  return { status: "saved" };
}

function finish(
  error: PostgrestError | null,
  input: CategoryInput,
): CategoryFormState {
  if (error?.code === UNIQUE_VIOLATION) {
    return {
      status: "error",
      message: `You already have a category named "${input.name}".`,
    };
  }
  if (error) throw error;
  refresh();
  return { status: "saved" };
}
