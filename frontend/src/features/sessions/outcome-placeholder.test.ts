import { describe, expect, it } from "vitest";
import { outcomePlaceholder } from "./outcome-placeholder";

const brainstorm = {
  categoryName: "Brainstorm",
  kind: "preparation",
  projectName: "FocusTrack",
} as const;

describe("outcomePlaceholder", () => {
  it("picks a line from the session's category", () => {
    expect(outcomePlaceholder(brainstorm, () => 0)).toBe(
      "Mapped out three ideas…",
    );
  });

  it("varies with the random value", () => {
    expect(outcomePlaceholder(brainstorm, () => 0.5)).toBe(
      "Picked a direction…",
    );
  });

  it("fills in the project name", () => {
    expect(outcomePlaceholder(brainstorm, () => 0.99)).toBe(
      "Rethought the FocusTrack onboarding…",
    );
  });

  it("ignores case and surrounding spaces in the category name", () => {
    expect(
      outcomePlaceholder({ ...brainstorm, categoryName: " brainstorm " }, () => 0),
    ).toBe("Mapped out three ideas…");
  });

  it("falls back to the kind for a custom category", () => {
    expect(
      outcomePlaceholder(
        { categoryName: "Write", kind: "execution", projectName: "Album" },
        () => 0.99,
      ),
    ).toBe("Moved Album forward…");
    expect(
      outcomePlaceholder(
        { categoryName: "Plan", kind: "preparation", projectName: "Album" },
        () => 0,
      ),
    ).toBe("Worked out next steps…");
  });

  it("treats inherited object keys as custom categories", () => {
    for (const categoryName of ["constructor", "__proto__", "toString"]) {
      expect(
        outcomePlaceholder({ ...brainstorm, categoryName }, () => 0),
      ).toBe("Worked out next steps…");
    }
  });

  it("keeps replacement patterns in a project name literal", () => {
    expect(
      outcomePlaceholder({ ...brainstorm, projectName: "R&D $&" }, () => 0.99),
    ).toBe("Rethought the R&D $& onboarding…");
  });

  it("skips project lines when the name is too long for one line", () => {
    const projectName = "A very long project name indeed";
    expect(outcomePlaceholder({ ...brainstorm, projectName }, () => 0.99)).toBe(
      "Picked a direction…",
    );
    expect(
      outcomePlaceholder(
        { categoryName: "Write", kind: "execution", projectName },
        () => 0.99,
      ),
    ).toBe("Finished the next piece…");
  });
});
