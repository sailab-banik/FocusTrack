import { createClient } from "@/lib/supabase/server";

export type RunningSession = {
  id: string;
  projectId: string;
  categoryId: string;
  startedAt: string;
  // Set while a pause is in progress.
  pausedAt: string | null;
  pausedSeconds: number;
  // Start of the current stretch if the session has been paused before.
  resumedAt: string | null;
};

export async function getRunningSession(): Promise<RunningSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, project_id, category_id, started_at, paused_at, paused_seconds, resumed_at",
    )
    .is("ended_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    projectId: data.project_id,
    categoryId: data.category_id,
    startedAt: data.started_at,
    pausedAt: data.paused_at,
    pausedSeconds: data.paused_seconds,
    resumedAt: data.resumed_at,
  };
}

export type LastUsed = { projectId: string; categoryId: string };

export async function getLastUsed(): Promise<LastUsed | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("project_id, category_id")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { projectId: data.project_id, categoryId: data.category_id };
}

export type PastSession = {
  id: string;
  projectId: string;
  categoryId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
  // Null only for sessions stopped before logging was required.
  description: string | null;
  outcome: string | null;
  energy: number | null;
  difficulty: number | null;
  notes: string | null;
};

export const HISTORY_PAGE_SIZE = 50;

// One literal string: Supabase infers the row type from it.
const PAST_SESSION_COLUMNS =
  "id, project_id, category_id, started_at, ended_at, paused_seconds, description, outcome, energy, difficulty, notes";

/** Newest first. Fetches one extra row to tell whether older sessions exist. */
export async function listPastSessions(
  before: Date | null,
): Promise<{ sessions: PastSession[]; hasMore: boolean }> {
  const supabase = await createClient();
  let query = supabase
    .from("sessions")
    .select(PAST_SESSION_COLUMNS)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(HISTORY_PAGE_SIZE + 1);
  if (before) query = query.lt("started_at", before.toISOString());

  const { data, error } = await query;
  if (error) throw error;
  return {
    sessions: data.slice(0, HISTORY_PAGE_SIZE).map(toPastSession),
    hasMore: data.length > HISTORY_PAGE_SIZE,
  };
}

/** Finished sessions started since the given time, in no particular order. */
export async function listSessionSpans(since: Date) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("project_id, category_id, started_at, ended_at, paused_seconds")
    .not("ended_at", "is", null)
    .gte("started_at", since.toISOString());
  if (error) throw error;
  return data.map((row) => ({
    projectId: row.project_id,
    categoryId: row.category_id,
    startedAt: row.started_at,
    // The query filters out running sessions.
    endedAt: row.ended_at!,
    pausedSeconds: row.paused_seconds,
  }));
}

export async function getPastSession(id: string): Promise<PastSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(PAST_SESSION_COLUMNS)
    .eq("id", id)
    .not("ended_at", "is", null)
    .maybeSingle();
  if (error) throw error;
  return data && toPastSession(data);
}

type PastSessionRow = {
  id: string;
  project_id: string;
  category_id: string;
  started_at: string;
  ended_at: string | null;
  paused_seconds: number;
  description: string | null;
  outcome: string | null;
  energy: number | null;
  difficulty: number | null;
  notes: string | null;
};

function toPastSession(row: PastSessionRow): PastSession {
  return {
    id: row.id,
    projectId: row.project_id,
    categoryId: row.category_id,
    startedAt: row.started_at,
    // The queries filter out running sessions.
    endedAt: row.ended_at!,
    pausedSeconds: row.paused_seconds,
    description: row.description,
    outcome: row.outcome,
    energy: row.energy,
    difficulty: row.difficulty,
    notes: row.notes,
  };
}
