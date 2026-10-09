"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { parseStartInput } from "./start-input";

export type StartFormState =
  | { status: "idle" }
  | { status: "error"; message: string };

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

export async function startSession(
  _state: StartFormState,
  formData: FormData,
): Promise<StartFormState> {
  await requireUser();
  const parsed = parseStartInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").insert({
    project_id: parsed.input.projectId,
    category_id: parsed.input.categoryId,
  });
  // Another device may have started a session since this page loaded.
  if (error?.code === UNIQUE_VIOLATION) {
    refresh();
    return { status: "error", message: "A session is already running." };
  }
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return {
      status: "error",
      message: "That project or category no longer exists. Reload the page.",
    };
  }
  if (error) throw error;
  refresh();
  return { status: "idle" };
}

export async function stopSession(id: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", id)
    .is("ended_at", null);
  if (error) throw error;
  refresh();
}
