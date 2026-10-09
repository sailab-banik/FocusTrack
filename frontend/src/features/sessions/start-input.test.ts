import { describe, expect, it } from "vitest";
import { parseStartInput } from "./start-input";

const PROJECT_ID = "aaaaaaaa-0000-4000-8000-000000000001";
const CATEGORY_ID = "bbbbbbbb-0000-4000-8000-000000000001";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseStartInput", () => {
  it("accepts a project and category id", () => {
    expect(
      parseStartInput(form({ projectId: PROJECT_ID, categoryId: CATEGORY_ID })),
    ).toEqual({
      ok: true,
      input: { projectId: PROJECT_ID, categoryId: CATEGORY_ID },
    });
  });

  it("requires a project", () => {
    expect(parseStartInput(form({ categoryId: CATEGORY_ID }))).toEqual({
      ok: false,
      error: "Choose a project.",
    });
  });

  it("requires a category", () => {
    expect(parseStartInput(form({ projectId: PROJECT_ID }))).toEqual({
      ok: false,
      error: "Choose a category.",
    });
  });

  it("rejects ids that are not UUIDs", () => {
    expect(
      parseStartInput(form({ projectId: "1; drop", categoryId: CATEGORY_ID }))
        .ok,
    ).toBe(false);
  });
});
