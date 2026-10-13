import type { AiProvider } from "@/features/ai/provider";
import { createClient } from "@/lib/supabase/server";
import { CLAIM_TTL_MS } from "./claims";
import { buildReportContext } from "./context";
import { loadPeriodData } from "./period-data";
import {
  closedPeriods,
  PERIOD_KINDS,
  type Period,
  type PeriodKind,
} from "./periods";
import { buildUserPrompt, PROMPT_VERSION, SYSTEM_PROMPT } from "./prompt";
import { listPeriodSessions } from "./queries";
import { parseReport, REPORT_SCHEMA } from "./schema";

// How many earlier periods each report is compared with.
const PREVIOUS_PERIODS: Record<PeriodKind, number> = {
  day: 7,
  week: 4,
  month: 3,
};

export type ReportClaim = {
  id: string;
  kind: PeriodKind;
  /** Oldest first; the last entry is the period to report on. */
  periods: Period[];
};

type Client = Awaited<ReturnType<typeof createClient>>;

/**
 * Claims the reports for yesterday, last week, and last month, wherever the
 * period has sessions and no report yet. One report per period is the cap on
 * provider calls: a claim is only handed out once, or again after an attempt
 * has gone stale. Runs as the signed-in user, so RLS scopes every query.
 */
export async function claimDueReports(
  now: Date,
  timeZone: string,
): Promise<ReportClaim[]> {
  const due = PERIOD_KINDS.map((kind) => ({
    kind,
    periods: closedPeriods(kind, now, timeZone, PREVIOUS_PERIODS[kind] + 1),
  }));
  const supabase = await createClient();

  // One query settles the usual case, where every report is already written.
  const { data: existing, error } = await supabase
    .from("reports")
    .select("period, period_start, written_at, claimed_at")
    .in(
      "period_start",
      due.map(({ periods }) => periods.at(-1)!.startKey),
    );
  if (error) throw error;
  const staleBefore = now.getTime() - CLAIM_TTL_MS;
  const settled = new Set(
    existing
      .filter(
        (row) =>
          row.written_at !== null || Date.parse(row.claimed_at) >= staleBefore,
      )
      .map((row) => `${row.period} ${row.period_start}`),
  );

  const claims = await Promise.all(
    due.map(async ({ kind, periods }) => {
      const period = periods.at(-1)!;
      if (settled.has(`${kind} ${period.startKey}`)) return null;
      if (!(await hasSessions(supabase, period))) return null;
      const id = await claim(supabase, kind, period.startKey, staleBefore);
      return id === null ? null : { id, kind, periods };
    }),
  );
  return claims.filter((claim) => claim !== null);
}

async function hasSessions(supabase: Client, period: Period): Promise<boolean> {
  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .not("ended_at", "is", null)
    .gte("started_at", period.start.toISOString())
    .lt("started_at", period.end.toISOString());
  if (error) throw error;
  return count! > 0;
}

/** The claimed row's id, or null when another request holds the claim. */
async function claim(
  supabase: Client,
  kind: PeriodKind,
  periodStart: string,
  staleBefore: number,
): Promise<string | null> {
  const key = { period: kind, period_start: periodStart };
  const inserted = await supabase
    .from("reports")
    .upsert(key, {
      onConflict: "user_id,period,period_start",
      ignoreDuplicates: true,
    })
    .select("id");
  if (inserted.error) throw inserted.error;
  if (inserted.data.length > 0) return inserted.data[0].id;

  // An earlier attempt failed or was cut off; take its claim over. The
  // database stamps claimed_at itself, so the value sent here is ignored.
  const retaken = await supabase
    .from("reports")
    .update({ claimed_at: new Date().toISOString() })
    .match(key)
    .is("written_at", null)
    .lt("claimed_at", new Date(staleBefore).toISOString())
    .select("id");
  if (retaken.error) throw retaken.error;
  return retaken.data.length > 0 ? retaken.data[0].id : null;
}

/**
 * Writes a claimed report. A failure leaves the claim unwritten; once it is
 * stale, the next time the app is opened claims and tries it again.
 */
export async function writeReport(
  provider: AiProvider,
  claim: ReportClaim,
  timeZone: string,
): Promise<void> {
  const [data, sessions] = await Promise.all([
    loadPeriodData(claim.periods, timeZone),
    listPeriodSessions(claim.periods.at(-1)!),
  ]);
  const context = buildReportContext({
    kind: claim.kind,
    stats: data.stats,
    goals: data.goals,
    projects: data.projects,
    categories: data.categories,
    sessions,
    timeZone,
  });
  const report = parseReport(
    await provider.generateJson({
      system: SYSTEM_PROMPT,
      user: buildUserPrompt(context),
      schemaName: "work_report",
      schema: REPORT_SCHEMA,
    }),
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({
      ...report,
      provider: provider.name,
      model: provider.model,
      prompt_version: PROMPT_VERSION,
      written_at: new Date().toISOString(),
    })
    .eq("id", claim.id);
  if (error) throw error;
}
