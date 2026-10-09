import { describe, expect, it } from "vitest";
import { parseResponsesBody } from "./openai";

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
