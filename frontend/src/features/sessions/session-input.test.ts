import { describe, expect, it } from "vitest";
import { parseSessionInput } from "./session-input";

const NOW = new Date("2026-10-09T12:00:00Z");
const ZONE = "Asia/Kolkata";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = {
  projectId: "aaaaaaaa-0000-4000-8000-000000000001",
  categoryId: "bbbbbbbb-0000-4000-8000-000000000001",
  startedAt: "2026-10-09T09:00",
  endedAt: "2026-10-09T10:30",
  description: "Wrote the history page",
  outcome: "History lists sessions by day",
};

describe("parseSessionInput", () => {
  it("parses ids, log fields, and local times in the user's timezone", () => {
    const result = parseSessionInput(form(valid), ZONE, NOW);
    expect(result).toMatchObject({
      ok: true,
      input: {
        projectId: valid.projectId,
        categoryId: valid.categoryId,
        description: valid.description,
        startedAt: new Date("2026-10-09T03:30:00Z"),
        endedAt: new Date("2026-10-09T05:00:00Z"),
      },
    });
  });

  it("rejects an end time at or before the start", () => {
    expect(
      parseSessionInput(form({ ...valid, endedAt: valid.startedAt }), ZONE, NOW)
        .ok,
    ).toBe(false);
  });

  it("rejects an end time in the future, allowing the current minute", () => {
    // NOW is 17:30 in Kolkata.
    expect(
      parseSessionInput(form({ ...valid, endedAt: "2026-10-09T17:30" }), ZONE, NOW)
        .ok,
    ).toBe(true);
    expect(
      parseSessionInput(form({ ...valid, endedAt: "2026-10-09T17:45" }), ZONE, NOW)
        .ok,
    ).toBe(false);
  });

  it("rejects sessions longer than 24 hours", () => {
    expect(
      parseSessionInput(
        form({ ...valid, startedAt: "2026-10-08T09:00" }),
        ZONE,
        NOW,
      ).ok,
    ).toBe(false);
  });

  it("rejects malformed times", () => {
    expect(
      parseSessionInput(form({ ...valid, startedAt: "9am" }), ZONE, NOW).ok,
    ).toBe(false);
  });

  it("requires the log fields", () => {
    expect(
      parseSessionInput(form({ ...valid, outcome: " " }), ZONE, NOW).ok,
    ).toBe(false);
  });
});
