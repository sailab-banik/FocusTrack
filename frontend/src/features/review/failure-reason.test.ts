import { describe, expect, it } from "vitest";
import { failureReason } from "./failure-reason";

describe("failureReason", () => {
  it("names timeouts and rate limits", () => {
    expect(failureReason(new DOMException("x", "TimeoutError"))).toBe(
      "Provider timeout",
    );
    expect(failureReason(new Error("OpenAI request failed (429): slow"))).toBe(
      "Rate limited by provider",
    );
  });

  it("never carries the provider's own words", () => {
    const secret = "Shipped the secret launch";
    const reason = failureReason(new Error(`OpenAI request failed (500): ${secret}`));
    expect(reason).toBe("Provider error");
  });

  it("names responses that are not valid JSON", () => {
    expect(failureReason(new SyntaxError("bad"))).toBe(
      "Response failed schema check",
    );
    expect(failureReason(new Error("Report has no observations"))).toBe(
      "Response failed schema check",
    );
  });

  it("falls back for anything else", () => {
    expect(failureReason("boom")).toBe("Unexpected error");
  });
});
