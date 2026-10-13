import { createClient } from "@/lib/supabase/server";
import type { WeekSession } from "./context";
import type { Observation } from "./schema";

export type StoredReview = {
  headline: string;
  observations: Observation[];
  nextAction: string;
  model: string;
  createdAt: string;
};

/** The newest review written for the week starting on `weekStart`. */
export async function getLatestReview(
  weekStart: string,
): Promise<StoredReview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("headline, observations, next_action, model, created_at")
    .eq("week_start", weekStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    headline: data.headline,
    // Only written after parseReview validated it.
    observations: data.observations as Observation[],
    nextAction: data.next_action,
    model: data.model,
    createdAt: data.created_at,
  };
}

/** Finished sessions since `since`, newest first, with their AI score. */
export async function listWeekSessions(since: Date): Promise<WeekSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "project_id, category_id, started_at, ended_at, paused_seconds, outcome, session_evaluations(overall_contribution)",
    )
    .not("ended_at", "is", null)
    .gte("started_at", since.toISOString())
    .order("started_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    projectId: row.project_id,
    categoryId: row.category_id,
    startedAt: row.started_at,
    // The query filters out running sessions.
    endedAt: row.ended_at!,
    pausedSeconds: row.paused_seconds,
    outcome: row.outcome,
    // At most one: session_evaluations.session_id is unique.
    aiOverall: row.session_evaluations[0]?.overall_contribution ?? null,
  }));
}
