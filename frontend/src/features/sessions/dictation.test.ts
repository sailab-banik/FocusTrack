import { describe, expect, it } from "vitest";
import {
  appendDictation,
  dictationErrorMessage,
  formatDictation,
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

describe("formatDictation", () => {
  it("turns spoken punctuation into marks", () => {
    expect(
      formatDictation(
        "fixed the bug comma added tests full stop what next question mark",
        true,
      ),
    ).toBe("Fixed the bug, added tests. What next?");
  });

  it("capitalizes the start only when it begins a sentence", () => {
    expect(formatDictation("and tests", false)).toBe("and tests");
    expect(formatDictation("and tests", true)).toBe("And tests");
  });

  it("leaves text a phone already punctuated as it was", () => {
    expect(formatDictation("Fixed the bug. Added tests.", true)).toBe(
      "Fixed the bug. Added tests.",
    );
  });

  it("keeps period as a word", () => {
    expect(formatDictation("tested the trial period exclamation mark", true)).toBe(
      "Tested the trial period!",
    );
  });
});

describe("appendDictation", () => {
  it("starts a new sentence after a full stop", () => {
    expect(appendDictation("Shipped filters.", "added tests", 500)).toBe(
      "Shipped filters. Added tests",
    );
  });

  it("attaches a spoken mark to the written text", () => {
    expect(appendDictation("Shipped filters", "full stop", 500)).toBe(
      "Shipped filters.",
    );
  });

  it("uses the spoken text when nothing is written", () => {
    expect(appendDictation("", " fixed the login bug ", 500)).toBe(
      "Fixed the login bug",
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
