import { describe, expect, it } from "vitest";
import { parseResponsesBody, parseUsage } from "./openai";

describe("parseResponsesBody", () => {
  it("parses the JSON from the output_text item", () => {
    expect(
      parseResponsesBody({
        status: "completed",
        output: [
          { type: "reasoning" },
          {
            type: "message",
            content: [{ type: "output_text", text: '{"score":3}' }],
          },
        ],
      }),
    ).toEqual({ score: 3 });
  });

  it("throws on a refusal", () => {
    expect(() =>
      parseResponsesBody({
        output: [
          {
            type: "message",
            content: [{ type: "refusal", refusal: "Cannot help" }],
          },
        ],
      }),
    ).toThrow("OpenAI refused: Cannot help");
  });

  it("throws when there is no output text", () => {
    expect(() =>
      parseResponsesBody({ status: "incomplete", output: [] }),
    ).toThrow("no output");
  });
});

describe("parseUsage", () => {
  it("reads the token counts", () => {
    expect(
      parseUsage({ usage: { input_tokens: 2800, output_tokens: 450 } }),
    ).toEqual({ inputTokens: 2800, outputTokens: 450 });
  });

  it("is null when they are missing or malformed", () => {
    expect(parseUsage({})).toBeNull();
    expect(parseUsage({ usage: { input_tokens: "1" } })).toBeNull();
  });
});
