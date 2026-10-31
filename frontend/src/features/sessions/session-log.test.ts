import { describe, expect, it } from "vitest";
import { parseSessionLog, resolveEndedAt } from "./session-log";

const STOPPED_AT = "2026-10-09T10:30:00.000Z";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = {
  outcome: " Session logging works end to end ",
  stoppedAt: STOPPED_AT,
};

describe("parseSessionLog", () => {
  it("accepts the required fields and leaves optional ones empty", () => {
    expect(parseSessionLog(form(valid))).toEqual({
      ok: true,
      log: {
        outcome: "Session logging works end to end",
        stoppedAt: new Date(STOPPED_AT),
      },
    });
  });

  it("requires a non-blank comment", () => {
    expect(parseSessionLog(form({ ...valid, outcome: "  " })).ok).toBe(false);
    expect(parseSessionLog(form({ ...valid, outcome: "" })).ok).toBe(false);
  });

  it("enforces length limits", () => {
    expect(
      parseSessionLog(form({ ...valid, outcome: "a".repeat(501) })).ok,
    ).toBe(false);
  });

  it("requires a valid stop time", () => {
    expect(parseSessionLog(form({ ...valid, stoppedAt: "soon" })).ok).toBe(
      false,
    );
  });
});

describe("resolveEndedAt", () => {
  const now = new Date("2026-10-09T10:31:00.000Z");

  it("keeps a stop time in the past", () => {
    const stoppedAt = new Date(STOPPED_AT);
    expect(resolveEndedAt(stoppedAt, now, null)).toEqual(stoppedAt);
  });

  it("caps a stop time in the future at now", () => {
    const future = new Date("2026-10-09T11:00:00.000Z");
    expect(resolveEndedAt(future, now, null)).toEqual(now);
  });

  it("ends a paused session when the pause began", () => {
    const pausedAt = new Date("2026-10-09T10:05:00.000Z");
    expect(resolveEndedAt(new Date(STOPPED_AT), now, pausedAt)).toEqual(
      pausedAt,
    );
  });
});
