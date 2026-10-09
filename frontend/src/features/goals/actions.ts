"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { parseGoalInput } from "./goal-input";

export type GoalFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

const UNIQUE_VIOLATION = "23505";

// user_id is never sent: the column defaults to auth.uid() and RLS rejects
// rows that belong to anyone else.
export async function createGoal(
  _state: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  await requireUser();
  const parsed = parseGoalInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert(parsed.input);
  return finish(error);
}

export async function updateGoal(
  _state: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  await requireUser();
  const id = formData.get("id");
  if (!isUuid(id)) return { status: "error", message: "Missing goal." };
  const parsed = parseGoalInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update(parsed.input)
    .eq("id", id);
  return finish(error);
}

export async function setGoalArchived(
  id: string,
  archived: boolean,
): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
  refresh();
}

function finish(error: PostgrestError | null): GoalFormState {
  if (error?.code === UNIQUE_VIOLATION) {
    return { status: "error", message: "You already have a goal like that." };
  }
  if (error) throw error;
  refresh();
  return { status: "saved" };
}
