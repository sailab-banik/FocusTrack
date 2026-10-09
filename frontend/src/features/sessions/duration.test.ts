import { describe, expect, it } from "vitest";
import {
  durationSeconds,
  formatClock,
  formatDuration,
  runningSeconds,
  sessionSeconds,
} from "./duration";

describe("durationSeconds", () => {
  it("returns whole seconds between start and end", () => {
    const start = new Date("2026-10-05T09:00:00.000Z");
    const end = new Date("2026-10-05T11:20:30.900Z");
    expect(durationSeconds(start, end)).toBe(8430);
  });
});

describe("sessionSeconds", () => {
  it("subtracts paused time from the start-to-end span", () => {
    expect(
      sessionSeconds({
        startedAt: "2026-10-05T09:00:00Z",
        endedAt: "2026-10-05T11:00:00Z",
        pausedSeconds: 1500,
      }),
    ).toBe(5700);
  });
});

describe("runningSeconds", () => {
  const startedAt = "2026-10-05T09:00:00Z";
  const now = new Date("2026-10-05T10:00:00Z");

  it("counts from the start when never paused", () => {
    expect(
      runningSeconds({ startedAt, pausedAt: null, pausedSeconds: 0 }, now),
    ).toBe(3600);
  });

  it("leaves out earlier pauses", () => {
    expect(
      runningSeconds({ startedAt, pausedAt: null, pausedSeconds: 600 }, now),
    ).toBe(3000);
  });

  it("stays frozen at the pause while paused", () => {
    const session = {
      startedAt,
      pausedAt: "2026-10-05T09:40:00Z",
      pausedSeconds: 600,
    };
    expect(runningSeconds(session, now)).toBe(1800);
    expect(runningSeconds(session, new Date("2026-10-05T12:00:00Z"))).toBe(
      1800,
    );
  });

  it("is never negative when the device clock is behind", () => {
    expect(
      runningSeconds(
        { startedAt, pausedAt: null, pausedSeconds: 0 },
        new Date("2026-10-05T08:59:58Z"),
      ),
    ).toBe(0);
  });
});

describe("formatDuration", () => {
  it("omits hours under one hour", () => {
    expect(formatDuration(35 * 60)).toBe("35m");
  });

  it("shows hours and minutes", () => {
    expect(formatDuration(8430)).toBe("2h 20m");
  });

  it("shows zero minutes for under a minute", () => {
    expect(formatDuration(59)).toBe("0m");
  });
});

describe("formatClock", () => {
  it("shows minutes and seconds under one hour", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(309)).toBe("05:09");
    expect(formatClock(3599)).toBe("59:59");
  });

  it("adds hours from one hour", () => {
    expect(formatClock(3600)).toBe("1:00:00");
    expect(formatClock(8430)).toBe("2:20:30");
  });
});
