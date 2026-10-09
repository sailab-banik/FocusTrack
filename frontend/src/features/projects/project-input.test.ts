import { describe, expect, it } from "vitest";
import { parseProjectName } from "./project-input";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseProjectName", () => {
  it("accepts and trims a name", () => {
    expect(parseProjectName(form({ name: "  FocusTrack " }))).toEqual({
      ok: true,
      name: "FocusTrack",
    });
  });

  it("rejects a missing or blank name", () => {
    expect(parseProjectName(form({})).ok).toBe(false);
    expect(parseProjectName(form({ name: "   " })).ok).toBe(false);
  });

  it("accepts 80 characters and rejects 81", () => {
    expect(parseProjectName(form({ name: "a".repeat(80) })).ok).toBe(true);
    expect(parseProjectName(form({ name: "a".repeat(81) })).ok).toBe(false);
  });
});
