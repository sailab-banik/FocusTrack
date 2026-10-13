import { describe, expect, it } from "vitest";
import { parseReport } from "./schema";

const valid = {
  headline: "Execution rose to 58% from a 41% average.",
  observations: [
    { title: "More building", evidence: "Build time doubled to 6h 10m." },
  ],
  next_action: "Ship the review page before Friday.",
};

describe("parseReport", () => {
  it("accepts a well-formed report", () => {
    expect(parseReport(valid)).toEqual(valid);
  });

  it("keeps at most four observations", () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      title: `T${i}`,
      evidence: `E${i}`,
    }));
    expect(parseReport({ ...valid, observations: many }).observations).toHaveLength(4);
  });

  it("rejects a report with no observations", () => {
    expect(() => parseReport({ ...valid, observations: [] })).toThrow(
      "no observations",
    );
  });

  it("rejects a blank headline", () => {
    expect(() => parseReport({ ...valid, headline: "  " })).toThrow(
      '"headline" is missing',
    );
  });

  it("rejects an observation without evidence", () => {
    expect(() =>
      parseReport({ ...valid, observations: [{ title: "T" }] }),
    ).toThrow('"evidence" is missing');
  });

  it("trims and truncates long text", () => {
    const report = parseReport({ ...valid, next_action: ` ${"x".repeat(600)} ` });
    expect(report.next_action).toHaveLength(500);
  });
});
