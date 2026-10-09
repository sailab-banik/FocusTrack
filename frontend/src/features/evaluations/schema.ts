import type { JsonSchema } from "@/features/ai/provider";

export const DIMENSIONS = [
  { key: "output", label: "Output" },
  { key: "skill_growth", label: "Skill growth" },
  { key: "goal_alignment", label: "Goal alignment" },
  { key: "leverage", label: "Leverage" },
  { key: "strategic_value", label: "Strategic value" },
  { key: "overall_contribution", label: "Overall contribution" },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];

export type EvaluationScores = Record<DimensionKey, number>;

export type EvaluationResult = EvaluationScores & {
  rationale: string;
  next_action: string;
};

const LIMITS = { rationale: 2000, next_action: 500 };

const score = { type: "integer", enum: [1, 2, 3, 4, 5] };

export const EVALUATION_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    ...Object.fromEntries(DIMENSIONS.map((d) => [d.key, score])),
    rationale: { type: "string" },
    next_action: { type: "string" },
  },
  required: [...DIMENSIONS.map((d) => d.key), "rationale", "next_action"],
  additionalProperties: false,
};

/** Validates a provider response. Throws: a bad response is not recoverable. */
export function parseEvaluation(raw: unknown): EvaluationResult {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Evaluation is not an object");
  }
  const record = raw as Record<string, unknown>;

  const scores = {} as EvaluationScores;
  for (const { key } of DIMENSIONS) {
    const value = record[key];
    if (!isScore(value)) {
      throw new Error(`Evaluation score "${key}" is not an integer 1-5`);
    }
    scores[key] = value;
  }

  return {
    ...scores,
    rationale: requiredText(record.rationale, "rationale", LIMITS.rationale),
    next_action: requiredText(
      record.next_action,
      "next_action",
      LIMITS.next_action,
    ),
  };
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

function requiredText(value: unknown, field: string, limit: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Evaluation "${field}" is missing`);
  }
  // Truncate rather than fail: an overly long rationale is still useful.
  return value.trim().slice(0, limit);
}
