import { describe, expect, it } from "vitest";
import { projectTint } from "./project-tint";

describe("projectTint", () => {
  it("gives a project the same tint every time", () => {
    const id = "7f3c2a10-1b2c-4d3e-8f90-a1b2c3d4e5f6";
    expect(projectTint(id)).toBe(projectTint(id));
  });

  it("spreads projects across the tints", () => {
    const tints = new Set(
      Array.from({ length: 40 }, (_, i) => projectTint(`project-${i}`)),
    );
    expect(tints.size).toBeGreaterThan(3);
  });
});
