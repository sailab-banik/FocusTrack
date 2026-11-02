"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/current-user";
import { getTimeZone } from "@/features/timezone/time-zone";
import { createClient } from "@/lib/supabase/server";
import { durationSeconds, pausedSecondsAfterResume } from "./duration";
import { parseSessionInput, type SessionInput } from "./session-input";
import { parseSessionLog, resolveEndedAt } from "./session-log";
import { isUuid } from "@/lib/uuid";
import {
  staleOutcome,
  staleSessionLine,
  type StaleOutcome,
} from "./stale-session";
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
  // Chosen by the client so the timer it shows before this save lands
  // already has the session's real id.
  const sessionId = formData.get("sessionId");
  if (!isUuid(sessionId)) throw new Error("Invalid session id");

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").insert({
    id: sessionId,
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
      outcome: log.outcome,
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
    const now = new Date();
    const { error } = await supabase
      .from("sessions")
      .update({
        paused_at: null,
        paused_seconds: pausedSecondsAfterResume(
          { pausedAt, pausedSeconds: paused.paused_seconds },
          now,
        ),
        resumed_at: now.toISOString(),
      })
      .eq("id", id)
      // Matching the pause read above keeps a second device from adding it twice.
      .eq("paused_at", pausedAt);
    if (error) throw error;
  }
  refresh();
}

// For a start made by mistake: deletes the session without logging it. Only
// a running session can be discarded; a finished one is deleted from its
// history page.
export async function discardSession(id: string): Promise<void> {
  await requireUser();
  if (!isUuid(id)) throw new Error("Invalid session id");
  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id)
    .is("ended_at", null);
  if (error) throw error;
  refresh();
}

export type ClosedSession = {
  outcome: StaleOutcome;
  sessionId: string;
  line: string;
  wasPaused: boolean;
  /** When the pause began, or when the unbroken stretch began. */
  since: string;
  /** Time worked if saved; the stretch without a pause if discarded. */
  seconds: number;
};

/**
 * Closes a session left on (see staleOutcome), when the timer page finds one.
 * Null if it no longer qualifies, for example because another device already
 * closed, paused, or resumed it.
 */
export async function closeStaleSession(
  id: string,
): Promise<ClosedSession | null> {
  await requireUser();
  if (!isUuid(id)) throw new Error("Invalid session id");
  const supabase = await createClient();
  const { data: row, error: readError } = await supabase
    .from("sessions")
    .select(
      "started_at, paused_at, paused_seconds, resumed_at, projects(name), categories(name)",
    )
    .eq("id", id)
    .is("ended_at", null)
    .maybeSingle();
  if (readError) throw readError;
  if (!row) return null;

  const now = new Date();
  const outcome = staleOutcome(
    {
      startedAt: row.started_at,
      pausedAt: row.paused_at,
      pausedSeconds: row.paused_seconds,
      resumedAt: row.resumed_at,
    },
    now,
  );
  if (!outcome) return null;
  const line = staleSessionLine(row.projects.name, row.categories.name);
  const pausedAt = row.paused_at;
  const since = pausedAt ?? row.resumed_at ?? row.started_at;

  // Matching the pause state read above leaves the session alone if another
  // device paused or resumed it in between.
  const { data, error } =
    outcome === "save"
      ? await supabase
          .from("sessions")
          .update({ ended_at: pausedAt, paused_at: null, outcome: line })
          .eq("id", id)
          .is("ended_at", null)
          .eq("paused_at", pausedAt!)
          .select("id")
      : await supabase
          .from("sessions")
          .delete()
          .eq("id", id)
          .is("ended_at", null)
          .filter("paused_at", pausedAt ? "eq" : "is", pausedAt)
          .filter("resumed_at", row.resumed_at ? "eq" : "is", row.resumed_at)
          .select("id");
  if (error) throw error;
  refresh();
  if (data.length === 0) return null;

  return {
    outcome,
    sessionId: id,
    line,
    wasPaused: pausedAt !== null,
    since,
    seconds: pausedAt
      ? durationSeconds(new Date(row.started_at), new Date(pausedAt)) -
        row.paused_seconds
      : durationSeconds(new Date(since), now),
  };
}

const HISTORY_PATH = "/log";

export async function createSession(
  _state: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireUser();
  const parsed = parseSessionInput(formData, await getTimeZone(), new Date());
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").insert(toRow(parsed.input));
  if (error) return saveFailure(error);
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
    outcome: input.outcome,
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
