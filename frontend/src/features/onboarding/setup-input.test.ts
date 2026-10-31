import { describe, expect, it } from "vitest";
import { parseSetupInput } from "./setup-input";

const BUILD = "7f3c2a10-1b2c-4d3e-8f90-a1b2c3d4e5f6";
const LEARN = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

function form(fields: [string, string][]) {
  const data = new FormData();
  for (const [key, value] of fields) data.append(key, value);
  return data;
}

describe("parseSetupInput", () => {
  it("reads the project, its reason, and the sorted categories", () => {
    expect(
      parseSetupInput(
        form([
          ["name", "  Portfolio site "],
          ["why", " Land a senior role "],
          ["execution", BUILD],
          ["preparation", LEARN],
        ]),
      ),
    ).toEqual({
      ok: true,
      input: {
        projectName: "Portfolio site",
        why: "Land a senior role",
        executionIds: [BUILD],
        preparationIds: [LEARN],
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

  it("rejects category ids that are not uuids", () => {
    const result = parseSetupInput(
      form([
        ["name", "Album"],
        ["execution", "not-an-id"],
      ]),
    );
    expect(result.ok).toBe(false);
  });
});
