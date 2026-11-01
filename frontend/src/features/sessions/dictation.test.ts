import { describe, expect, it } from "vitest";
import {
  appendDictation,
  dictationErrorMessage,
  joinResults,
} from "./dictation";

describe("joinResults", () => {
  it("joins separate phrases as the browser spaced them", () => {
    expect(joinResults(["fixed the bug", " and shipped"])).toBe(
      "fixed the bug and shipped",
    );
  });

  it("adds a space when the browser left it out", () => {
    expect(joinResults(["fixed the bug", "and shipped"])).toBe(
      "fixed the bug and shipped",
    );
  });

  it("does not repeat text when each result restates the last", () => {
    expect(
      joinResults(["fixed", "fixed the", "fixed the bug", "fixed the bug"]),
    ).toBe("fixed the bug");
  });

  it("is empty before anything is heard", () => {
    expect(joinResults([])).toBe("");
  });
});

describe("appendDictation", () => {
  it("uses the spoken text when nothing is written", () => {
    expect(appendDictation("", " fixed the login bug ", 500)).toBe(
      "fixed the login bug",
    );
  });

  it("adds to what is written with one space", () => {
    expect(appendDictation("Shipped filters  ", "and tests", 500)).toBe(
      "Shipped filters and tests",
    );
  });

  it("leaves the text alone when nothing was heard", () => {
    expect(appendDictation("Shipped filters ", "  ", 500)).toBe(
      "Shipped filters ",
    );
  });

  it("stops at the length limit", () => {
    expect(appendDictation("abc", "defgh", 6)).toBe("abc de");
  });
});

describe("dictationErrorMessage", () => {
  it("stays quiet when the dialog closed mid-dictation", () => {
    expect(dictationErrorMessage("aborted")).toBeNull();
  });

  it("explains a blocked microphone", () => {
    expect(dictationErrorMessage("not-allowed")).toContain("Microphone access");
  });

  it("falls back to typing for an unknown error", () => {
    expect(dictationErrorMessage("language-not-supported")).toContain(
      "Type it instead",
    );
  });
});
