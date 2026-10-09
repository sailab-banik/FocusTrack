import { getAiProvider } from "@/features/ai/get-provider";
import { createClient } from "@/lib/supabase/server";
import { buildEvaluationContext, HISTORY_WINDOW_DAYS } from "./context";
import { buildUserPrompt, PROMPT_VERSION, SYSTEM_PROMPT } from "./prompt";
import { EVALUATION_SCHEMA, parseEvaluation } from "./schema";

export type EvaluationOutcome = "evaluated" | "not-configured" | "not-logged";

/**
 * Evaluates a stopped session and stores the result, replacing any earlier
 * evaluation. Runs as the signed-in user, so RLS scopes every query.
 */
export async function evaluateSession(
  sessionId: string,
): Promise<EvaluationOutcome> {
  const provider = getAiProvider();
  if (!provider) return "not-configured";

  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select(
      "id, project_id, category_id, started_at, ended_at, description, outcome, energy, difficulty, notes",
    )
    .eq("id", sessionId)
    .not("ended_at", "is", null)
    .single();
  if (sessionError) throw sessionError;
  // Sessions stopped before logging was required have nothing to judge.
  if (!session.description || !session.outcome) return "not-logged";

  const windowStart = new Date(
    new Date(session.started_at).getTime() - HISTORY_WINDOW_DAYS * 86_400_000,
  );
  const [projectResult, categoriesResult, priorResult] = await Promise.all([
    supabase
      .from("projects")
      .select("name, goal:goals(title, description)")
      .eq("id", session.project_id)
      .single(),
    supabase.from("categories").select("id, name, kind"),
    supabase
      .from("sessions")
      .select("started_at, ended_at, category_id, description, outcome")
      .eq("project_id", session.project_id)
      .not("ended_at", "is", null)
      .lt("started_at", session.started_at)
      .gte("started_at", windowStart.toISOString())
      .order("started_at", { ascending: false }),
  ]);
  if (projectResult.error) throw projectResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (priorResult.error) throw priorResult.error;

  const context = buildEvaluationContext({
    session: {
      startedAt: session.started_at,
      endedAt: session.ended_at!,
      categoryId: session.category_id,
      description: session.description,
      outcome: session.outcome,
      energy: session.energy,
      difficulty: session.difficulty,
      notes: session.notes,
    },
    projectName: projectResult.data.name,
    goal: projectResult.data.goal,
    categories: categoriesResult.data,
    priorSessions: priorResult.data.map((row) => ({
      startedAt: row.started_at,
      endedAt: row.ended_at!,
      categoryId: row.category_id,
      description: row.description,
      outcome: row.outcome,
    })),
  });

  const evaluation = parseEvaluation(
    await provider.generateJson({
      system: SYSTEM_PROMPT,
      user: buildUserPrompt(context),
      schemaName: "session_evaluation",
      schema: EVALUATION_SCHEMA,
    }),
  );

  const { error: saveError } = await supabase.from("session_evaluations").upsert(
    {
      session_id: sessionId,
      ...evaluation,
      provider: provider.name,
      model: provider.model,
      prompt_version: PROMPT_VERSION,
      created_at: new Date().toISOString(),
    },
    { onConflict: "session_id" },
  );
  if (saveError) throw saveError;
  return "evaluated";
}
