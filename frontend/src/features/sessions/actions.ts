"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/current-user";
import { getTimeZone } from "@/features/timezone/time-zone";
import { createClient } from "@/lib/supabase/server";
import { parseSessionInput, type SessionInput } from "./session-input";
import { parseSessionLog, resolveEndedAt } from "./session-log";
import { isUuid } from "@/lib/uuid";
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

const HISTORY_PATH = "/sessions";

export async function createSession(
  _state: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireUser();
  const parsed = parseSessionInput(formData, await getTimeZone(), new Date());
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .insert(toRow(parsed.input));
  const failure = saveFailure(error);
  if (failure) return failure;
  redirect(HISTORY_PATH);
}

export async function updateSession(
  _state: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireUser();
  const id = formData.get("id");
  if (!isUuid(id)) return { status: "error", message: "Missing session." };
  const parsed = parseSessionInput(formData, await getTimeZone(), new Date());
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .update(toRow(parsed.input))
    .eq("id", id)
    .not("ended_at", "is", null)
    .select("id");
  const failure = saveFailure(error);
  if (failure) return failure;
  if (data?.length === 0) {
    return { status: "error", message: "This session no longer exists." };
  }
  redirect(HISTORY_PATH);
}

export async function deleteSession(id: string): Promise<void> {
  await requireUser();
  if (!isUuid(id)) throw new Error("Invalid session id");
  const supabase = await createClient();
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
  redirect(HISTORY_PATH);
}

function toRow(input: SessionInput) {
  return {
    project_id: input.projectId,
    category_id: input.categoryId,
    started_at: input.startedAt.toISOString(),
    ended_at: input.endedAt.toISOString(),
    description: input.description,
    outcome: input.outcome,
    energy: input.energy,
    difficulty: input.difficulty,
    notes: input.notes,
  };
}

function saveFailure(error: PostgrestError | null): SessionFormState | null {
  if (!error) return null;
  if (error.code === FOREIGN_KEY_VIOLATION) {
    return {
      status: "error",
      message: "That project or category no longer exists. Reload the page.",
    };
  }
  throw error;
}
