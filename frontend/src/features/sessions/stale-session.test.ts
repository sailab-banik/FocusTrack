import { describe, expect, it } from "vitest";
import { staleOutcome, staleSessionLine } from "./stale-session";

const NOW = new Date("2026-11-02T12:00:00Z");

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 3_600_000).toISOString();
}

function session(overrides: Partial<Parameters<typeof staleOutcome>[0]>) {
  return {
    startedAt: hoursAgo(20),
    pausedAt: null,
    pausedSeconds: 0,
    resumedAt: null,
    ...overrides,
  };
}

describe("staleOutcome", () => {
  it("discards a session running 12 hours without a pause", () => {
    expect(staleOutcome(session({ startedAt: hoursAgo(12) }), NOW)).toBe(
      "discard",
    );
    expect(
      staleOutcome(session({ startedAt: hoursAgo(11.9) }), NOW),
    ).toBeNull();
  });

  it("counts a resumed session from its last resume", () => {
    expect(
      staleOutcome(session({ resumedAt: hoursAgo(3), pausedSeconds: 600 }), NOW),
    ).toBeNull();
  });

  it("saves a session paused for 12 hours", () => {
    expect(
      staleOutcome(session({ startedAt: hoursAgo(14), pausedAt: hoursAgo(12) }), NOW),
    ).toBe("save");
    expect(
      staleOutcome(session({ startedAt: hoursAgo(14), pausedAt: hoursAgo(11) }), NOW),
    ).toBeNull();
  });

  it("discards a paused session with no time worked", () => {
    expect(
      staleOutcome(
        session({
          startedAt: hoursAgo(13),
          pausedAt: hoursAgo(12),
          pausedSeconds: 3570,
        }),
        NOW,
      ),
    ).toBe("discard");
  });
});

describe("staleSessionLine", () => {
  it("names the project and category", () => {
    expect(staleSessionLine("DSA", "Practice")).toBe("DSA · Practice");
  });
});
