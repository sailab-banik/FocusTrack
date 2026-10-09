import { describe, expect, it } from "vitest";
import { runningNudge } from "./running";

const startedAt = "2026-10-09T09:00:00Z";
const at = (time: string) => new Date(`2026-10-09T${time}:00Z`);

describe("runningNudge", () => {
  it("says nothing during a normal stretch", () => {
    expect(
      runningNudge({ startedAt, pausedAt: null, resumedAt: null }, at("10:29")),
    ).toBeNull();
  });

  it("suggests a break after 90 minutes without a pause", () => {
    expect(
      runningNudge({ startedAt, pausedAt: null, resumedAt: null }, at("10:32")),
    ).toEqual({ type: "break", stretchSeconds: 92 * 60 });
  });

  it("measures the stretch from the last resume, not the start", () => {
    const session = {
      startedAt,
      pausedAt: null,
      resumedAt: "2026-10-09T10:00:00Z",
    };
    expect(runningNudge(session, at("11:00"))).toBeNull();
    expect(runningNudge(session, at("11:30"))).toEqual({
      type: "break",
      stretchSeconds: 90 * 60,
    });
  });

  it("flags a pause that has run for 30 minutes", () => {
    const session = {
      startedAt,
      pausedAt: "2026-10-09T10:00:00Z",
      resumedAt: null,
    };
    expect(runningNudge(session, at("10:29"))).toBeNull();
    expect(runningNudge(session, at("10:45"))).toEqual({
      type: "long-pause",
      pausedSeconds: 45 * 60,
    });
  });

  it("never suggests a break while paused", () => {
    expect(
      runningNudge(
        { startedAt, pausedAt: "2026-10-09T11:00:00Z", resumedAt: null },
        at("11:05"),
      ),
    ).toBeNull();
  });
});
