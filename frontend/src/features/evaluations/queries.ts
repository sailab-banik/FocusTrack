import { createClient } from "@/lib/supabase/server";
import type { EvaluationResult } from "./schema";

export type StoredEvaluation = EvaluationResult & {
  model: string;
  promptVersion: string;
  createdAt: string;
};

export async function getEvaluation(
  sessionId: string,
): Promise<StoredEvaluation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_evaluations")
    .select(
      "output, skill_growth, goal_alignment, leverage, strategic_value, overall_contribution, rationale, next_action, model, prompt_version, created_at",
    )
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { prompt_version, created_at, ...rest } = data;
  return { ...rest, promptVersion: prompt_version, createdAt: created_at };
}
