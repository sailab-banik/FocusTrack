import { getAiProvider } from "@/features/ai/get-provider";
import { createClient } from "@/lib/supabase/server";
import { buildReviewContext } from "./context";
import { buildUserPrompt, PROMPT_VERSION, SYSTEM_PROMPT } from "./prompt";
import { listWeekSessions } from "./queries";
import { parseReview, REVIEW_SCHEMA } from "./schema";
import { loadWeekData } from "./week-data";

export type ReviewOutcome = "written" | "not-configured" | "no-sessions";

/**
 * Writes and stores an AI review of the current week. Runs as the signed-in
 * user, so RLS scopes every query.
 */
export async function writeWeeklyReview(
  now: Date,
  timeZone: string,
): Promise<ReviewOutcome> {
  const provider = getAiProvider();
  if (!provider) return "not-configured";

  const data = await loadWeekData(now, timeZone);
  if (data.stats.at(-1)!.sessionCount === 0) return "no-sessions";

  const context = buildReviewContext({
    stats: data.stats,
    daysCovered: data.daysCovered,
    goals: data.goals,
    projects: data.projects,
    categories: data.categories,
    sessions: await listWeekSessions(data.currentWeek.start),
    timeZone,
  });
  const review = parseReview(
    await provider.generateJson({
      system: SYSTEM_PROMPT,
      user: buildUserPrompt(context),
      schemaName: "weekly_review",
      schema: REVIEW_SCHEMA,
    }),
  );

  const supabase = await createClient();
  const { error } = await supabase.from("weekly_reviews").insert({
    week_start: data.currentWeek.startKey,
    ...review,
    provider: provider.name,
    model: provider.model,
    prompt_version: PROMPT_VERSION,
  });
  if (error) throw error;
  return "written";
}
