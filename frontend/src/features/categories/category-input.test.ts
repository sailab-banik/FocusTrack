import { describe, expect, it } from "vitest";
import { parseCategoryInput } from "./category-input";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseCategoryInput", () => {
  it("accepts a trimmed name and a valid kind", () => {
    expect(parseCategoryInput(form({ name: "  Write ", kind: "execution" })))
      .toEqual({ ok: true, input: { name: "Write", kind: "execution" } });
  });

  it("rejects missing fields", () => {
    expect(parseCategoryInput(form({ name: "Write" })).ok).toBe(false);
    expect(parseCategoryInput(form({ kind: "execution" })).ok).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(parseCategoryInput(form({ name: "   ", kind: "execution" })))
      .toEqual({ ok: false, error: "Enter a category name." });
  });

  it("accepts 40 characters and rejects 41", () => {
    expect(
      parseCategoryInput(form({ name: "a".repeat(40), kind: "preparation" })).ok,
    ).toBe(true);
    expect(
      parseCategoryInput(form({ name: "a".repeat(41), kind: "preparation" })).ok,
    ).toBe(false);
  });

  it("rejects an unknown kind", () => {
    expect(parseCategoryInput(form({ name: "Write", kind: "rest" })).ok).toBe(
      false,
    );
  });
});
