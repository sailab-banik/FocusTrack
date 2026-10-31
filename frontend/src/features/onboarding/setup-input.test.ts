import { describe, expect, it } from "vitest";
import { parseSetupInput } from "./setup-input";

function form(fields: [string, string][]) {
  const data = new FormData();
  for (const [key, value] of fields) data.append(key, value);
  return data;
}

describe("parseSetupInput", () => {
  it("reads the project and its reason", () => {
    expect(
      parseSetupInput(
        form([
          ["name", "  Portfolio site "],
          ["why", " Land a senior role "],
        ]),
      ),
    ).toEqual({
      ok: true,
      input: {
        projectName: "Portfolio site",
        why: "Land a senior role",
      },
    });
  });

  it("treats a blank reason as none", () => {
    const result = parseSetupInput(
      form([
        ["name", "Album"],
        ["why", "   "],
      ]),
    );
    expect(result).toMatchObject({ ok: true, input: { why: null } });
  });

  it("requires a project name", () => {
    expect(parseSetupInput(form([["name", " "]])).ok).toBe(false);
  });

  it("rejects a reason longer than a goal title", () => {
    const result = parseSetupInput(
      form([
        ["name", "Album"],
        ["why", "x".repeat(121)],
      ]),
    );
    expect(result.ok).toBe(false);
  });
});
