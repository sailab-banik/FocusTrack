"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/current-user";
import { scheduleEvaluation } from "@/features/evaluations/schedule";
import { getTimeZone } from "@/features/timezone/time-zone";
import { createClient } from "@/lib/supabase/server";
import { durationSeconds } from "./duration";
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
  const { data: running, error: readError } = await supabase
    .from("sessions")
    .select("paused_at")
    .eq("id", id)
    .is("ended_at", null)
    .maybeSingle();
  if (readError) throw readError;
  if (!running) {
    refresh();
    return { status: "error", message: ALREADY_STOPPED };
  }

  const endedAt = resolveEndedAt(
    log.stoppedAt,
    new Date(),
    running.paused_at ? new Date(running.paused_at) : null,
  );
  const { data, error } = await supabase
    .from("sessions")
    .update({
      ended_at: endedAt.toISOString(),
      paused_at: null,
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
  if (data.length === 0) return { status: "error", message: ALREADY_STOPPED };
  scheduleEvaluation(id);
  return { status: "idle" };
}

const ALREADY_STOPPED = "This session was already stopped on another device.";

// Pause and resume report nothing back: if another device got there first,
// the refreshed page simply shows the session's current state.
export async function pauseSession(id: string): Promise<void> {
  await requireUser();
  if (!isUuid(id)) throw new Error("Invalid session id");
  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ paused_at: new Date().toISOString() })
    .eq("id", id)
    .is("ended_at", null)
    .is("paused_at", null);
  if (error) throw error;
  refresh();
}

export async function resumeSession(id: string): Promise<void> {
  await requireUser();
  if (!isUuid(id)) throw new Error("Invalid session id");
  const supabase = await createClient();
  const { data: paused, error: readError } = await supabase
    .from("sessions")
    .select("paused_at, paused_seconds")
    .eq("id", id)
    .is("ended_at", null)
    .not("paused_at", "is", null)
    .maybeSingle();
  if (readError) throw readError;
  if (paused) {
    // The query above only returns sessions with a pause in progress.
    const pausedAt = paused.paused_at!;
    const { error } = await supabase
      .from("sessions")
      .update({
        paused_at: null,
        paused_seconds:
          paused.paused_seconds +
          durationSeconds(new Date(pausedAt), new Date()),
      })
      .eq("id", id)
      // Matching the pause read above keeps a second device from adding it twice.
      .eq("paused_at", pausedAt);
    if (error) throw error;
  }
  refresh();
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
  const { data, error } = await supabase
    .from("sessions")
    .insert(toRow(parsed.input))
    .select("id")
    .single();
  if (error) return saveFailure(error);
  scheduleEvaluation(data.id);
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
  // The edited times are valid on their own, so this is the paused time no
  // longer fitting between them.
  if (error?.code === CHECK_VIOLATION) {
    return {
      status: "error",
      message:
        "This session's paused time is longer than the new start-to-end span. Widen the times.",
    };
  }
  if (error) return saveFailure(error);
  if (data.length === 0) {
    return { status: "error", message: "This session no longer exists." };
  }
  // The log or times may have changed, so the old evaluation is stale.
  scheduleEvaluation(id);
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

function saveFailure(error: PostgrestError): SessionFormState {
  if (error.code === FOREIGN_KEY_VIOLATION) {
    return {
      status: "error",
      message: "That project or category no longer exists. Reload the page.",
    };
  }
  throw error;
}
