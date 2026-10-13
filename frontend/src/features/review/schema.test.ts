import { describe, expect, it } from "vitest";
import { parseReview } from "./schema";

const valid = {
  headline: "Execution rose to 58% from a 41% average.",
  observations: [
    { title: "More building", evidence: "Build time doubled to 6h 10m." },
  ],
  next_action: "Ship the review page before Friday.",
};

describe("parseReview", () => {
  it("accepts a well-formed review", () => {
    expect(parseReview(valid)).toEqual(valid);
  });

  it("keeps at most four observations", () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      title: `T${i}`,
      evidence: `E${i}`,
    }));
    expect(parseReview({ ...valid, observations: many }).observations).toHaveLength(4);
  });

  it("rejects a review with no observations", () => {
    expect(() => parseReview({ ...valid, observations: [] })).toThrow(
      "no observations",
    );
  });

  it("rejects a blank headline", () => {
    expect(() => parseReview({ ...valid, headline: "  " })).toThrow(
      '"headline" is missing',
    );
  });

  it("rejects an observation without evidence", () => {
    expect(() =>
      parseReview({ ...valid, observations: [{ title: "T" }] }),
    ).toThrow('"evidence" is missing');
  });

  it("trims and truncates long text", () => {
    const review = parseReview({ ...valid, next_action: ` ${"x".repeat(600)} ` });
    expect(review.next_action).toHaveLength(500);
  });
});
