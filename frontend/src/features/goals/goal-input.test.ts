import { describe, expect, it } from "vitest";
import { parseGoalInput } from "./goal-input";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseGoalInput", () => {
  it("trims the title and description", () => {
    expect(
      parseGoalInput(
        form({ title: " Release music ", description: " Two songs out " }),
      ),
    ).toEqual({
      ok: true,
      input: { title: "Release music", description: "Two songs out" },
    });
  });

  it("treats a blank or missing description as none", () => {
    expect(parseGoalInput(form({ title: "Ship", description: "  " }))).toEqual(
      { ok: true, input: { title: "Ship", description: null } },
    );
    expect(parseGoalInput(form({ title: "Ship" }))).toEqual({
      ok: true,
      input: { title: "Ship", description: null },
    });
  });

  it("requires a title", () => {
    expect(parseGoalInput(form({ title: "   " })).ok).toBe(false);
    expect(parseGoalInput(form({})).ok).toBe(false);
  });

  it("enforces length limits", () => {
    expect(parseGoalInput(form({ title: "a".repeat(121) })).ok).toBe(false);
    expect(
      parseGoalInput(form({ title: "Ship", description: "a".repeat(1001) })).ok,
    ).toBe(false);
  });
});
