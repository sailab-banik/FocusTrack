import { createClient } from "@/lib/supabase/server";
import { CLAIM_TTL_MS } from "./claims";
import type { PeriodSession } from "./context";
import { NOTICE_TTL_MS, type RecentReport } from "./notices";
import type { Period, PeriodKind } from "./periods";
import type { Observation } from "./schema";

export type StoredReport = {
  periodStart: string;
  headline: string;
  observations: Observation[];
  nextAction: string;
  model: string;
  writtenAt: string;
};

/** The newest written report of the given kind. */
export async function getLatestReport(
  kind: PeriodKind,
): Promise<StoredReport | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("period_start, headline, observations, next_action, model, written_at")
    .eq("period", kind)
    .not("written_at", "is", null)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  // The content columns are all set once written_at is.
  return {
    periodStart: data.period_start,
    headline: data.headline!,
    // Only written after parseReport validated it.
    observations: data.observations as Observation[],
    nextAction: data.next_action!,
    model: data.model!,
    writtenAt: data.written_at!,
  };
}

/** The kinds with a report claimed and still being written. */
export async function listKindsBeingWritten(now: Date): Promise<PeriodKind[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("period")
    .is("written_at", null)
    .gte("claimed_at", new Date(now.getTime() - CLAIM_TTL_MS).toISOString());
  if (error) throw error;
  // The table only accepts the three period kinds.
  return data.map((row) => row.period as PeriodKind);
}

/**
 * Reports written or claimed within the notice window. The database stamps
 * claimed_at on every change, so for a written report it is when it was
 * written.
 */
export async function listRecentReports(now: Date): Promise<RecentReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("period, period_start, written_at, claimed_at")
    .gte("claimed_at", new Date(now.getTime() - NOTICE_TTL_MS).toISOString());
  if (error) throw error;
  return data.map((row) => ({
    // The table only accepts the three period kinds.
    kind: row.period as PeriodKind,
    periodStart: row.period_start,
    writtenAt: row.written_at,
    claimedAt: row.claimed_at,
  }));
}

/** The period's finished sessions, newest first. */
export async function listPeriodSessions(
  period: Period,
): Promise<PeriodSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("project_id, category_id, started_at, ended_at, paused_seconds, outcome")
    .not("ended_at", "is", null)
    .gte("started_at", period.start.toISOString())
    .lt("started_at", period.end.toISOString())
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
  }));
}
