"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { parseSessionLog, resolveEndedAt } from "./session-log";
import { parseStartInput } from "./start-input";

export type SessionFormState =
  | { status: "idle" }
  | { status: "error"; message: string };

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const CHECK_VIOLATION = "23514";

export async function startSession(
  _state: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
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

export async function stopSession(
  _state: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string") {
    return { status: "error", message: "Missing session." };
  }
  const parsed = parseSessionLog(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const { log } = parsed;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .update({
      ended_at: resolveEndedAt(log.stoppedAt, new Date()).toISOString(),
      description: log.description,
      outcome: log.outcome,
      energy: log.energy,
      difficulty: log.difficulty,
      notes: log.notes,
    })
    .eq("id", id)
    .is("ended_at", null)
    .select("id");
  // A device clock behind the server can put the stop before the start.
  if (error?.code === CHECK_VIOLATION) {
    return {
      status: "error",
      message:
        "The stop time is before the start time. Check your device clock.",
    };
  }
  if (error) throw error;
  refresh();
  if (data.length === 0) {
    return {
      status: "error",
      message: "This session was already stopped on another device.",
    };
  }
  return { status: "idle" };
}
