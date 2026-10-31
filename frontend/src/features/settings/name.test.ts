import { describe, expect, it } from "vitest";
import { displayName, firstName } from "./name";

describe("displayName", () => {
  it("prefers the name set in Settings over Google's", () => {
    expect(displayName({ display_name: "Sam", full_name: "Sam Rivera" })).toBe(
      "Sam",
    );
  });

  it("falls back to the name from Google", () => {
    expect(displayName({ full_name: "Sam Rivera" })).toBe("Sam Rivera");
    expect(displayName({ name: "Sam" })).toBe("Sam");
  });

  it("treats a cleared name as no name, even with Google's on file", () => {
    expect(displayName({ display_name: "", full_name: "Sam Rivera" })).toBe("");
  });

  it("is empty without usable metadata", () => {
    expect(displayName(undefined)).toBe("");
    expect(displayName({ display_name: 3 })).toBe("");
  });
});

describe("firstName", () => {
  it("takes the first word", () => {
    expect(firstName("  Sam Rivera ")).toBe("Sam");
    expect(firstName("")).toBe("");
  });
});
