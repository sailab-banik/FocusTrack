"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { parseProjectName } from "./project-input";

export type ProjectFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

const UNIQUE_VIOLATION = "23505";

// user_id is never sent: the column defaults to auth.uid() and RLS rejects
// rows that belong to anyone else.
export async function createProject(
  _state: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireUser();
  const parsed = parseProjectName(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .insert({ name: parsed.name });
  return finish(error, parsed.name);
}

export async function renameProject(
  _state: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string") {
    return { status: "error", message: "Missing project." };
  }
  const parsed = parseProjectName(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ name: parsed.name })
    .eq("id", id);
  return finish(error, parsed.name);
}

export async function setProjectArchived(
  id: string,
  archived: boolean,
): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
  refresh();
}

function finish(
  error: PostgrestError | null,
  name: string,
): ProjectFormState {
  if (error?.code === UNIQUE_VIOLATION) {
    return {
      status: "error",
      message: `You already have a project named "${name}".`,
    };
  }
  if (error) throw error;
  refresh();
  return { status: "saved" };
}
