import { describe, expect, it } from "vitest";
import { parseEvaluation } from "./schema";

const valid = {
  output: 3,
  skill_growth: 2,
  goal_alignment: 4,
  leverage: 2,
  strategic_value: 3,
  overall_contribution: 3,
  rationale: " 90m of building produced a working form. ",
  next_action: " Ship it. ",
};

describe("parseEvaluation", () => {
  it("accepts a complete evaluation and trims text", () => {
    expect(parseEvaluation(valid)).toEqual({
      ...valid,
      rationale: "90m of building produced a working form.",
      next_action: "Ship it.",
    });
  });

  it("rejects missing or out-of-range scores", () => {
    expect(() => parseEvaluation({ ...valid, leverage: 0 })).toThrow(
      "leverage",
    );
    expect(() => parseEvaluation({ ...valid, output: 6 })).toThrow("output");
    expect(() => parseEvaluation({ ...valid, output: 2.5 })).toThrow("output");
    const missing: Record<string, unknown> = { ...valid };
    delete missing.skill_growth;
    expect(() => parseEvaluation(missing)).toThrow("skill_growth");
  });

  it("rejects missing text", () => {
    expect(() => parseEvaluation({ ...valid, rationale: " " })).toThrow(
      "rationale",
    );
  });

  it("truncates overly long text instead of failing", () => {
    const result = parseEvaluation({ ...valid, next_action: "a".repeat(600) });
    expect(result.next_action).toHaveLength(500);
  });

  it("rejects non-objects", () => {
    expect(() => parseEvaluation("3/5")).toThrow();
    expect(() => parseEvaluation(null)).toThrow();
  });
});
