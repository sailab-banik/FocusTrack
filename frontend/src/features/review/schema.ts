import type { JsonSchema } from "@/features/ai/provider";

export type Observation = { title: string; evidence: string };

export type ReportResult = {
  headline: string;
  observations: Observation[];
  next_action: string;
};

const LIMITS = { headline: 300, title: 80, evidence: 600, next_action: 500 };
const MAX_OBSERVATIONS = 4;

export const REPORT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    headline: { type: "string" },
    observations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          evidence: { type: "string" },
        },
        required: ["title", "evidence"],
        additionalProperties: false,
      },
    },
    next_action: { type: "string" },
  },
  required: ["headline", "observations", "next_action"],
  additionalProperties: false,
};

/** Validates a provider response. Throws: a bad response is not recoverable. */
export function parseReport(raw: unknown): ReportResult {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Report is not an object");
  }
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.observations) || record.observations.length === 0) {
    throw new Error("Report has no observations");
  }

  return {
    headline: requiredText(record.headline, "headline", LIMITS.headline),
    observations: record.observations
      .slice(0, MAX_OBSERVATIONS)
      .map((item: unknown) => {
        const observation = (item ?? {}) as Record<string, unknown>;
        return {
          title: requiredText(observation.title, "title", LIMITS.title),
          evidence: requiredText(
            observation.evidence,
            "evidence",
            LIMITS.evidence,
          ),
        };
      }),
    next_action: requiredText(
      record.next_action,
      "next_action",
      LIMITS.next_action,
    ),
  };
}

function requiredText(value: unknown, field: string, limit: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Report "${field}" is missing`);
  }
  // Truncate rather than fail: an overly long sentence is still useful.
  return value.trim().slice(0, limit);
}
