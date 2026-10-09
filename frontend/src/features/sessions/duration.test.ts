import { describe, expect, it } from "vitest";
import { durationSeconds, formatClock, formatDuration } from "./duration";

describe("durationSeconds", () => {
  it("returns whole seconds between start and end", () => {
    const start = new Date("2026-10-05T09:00:00.000Z");
    const end = new Date("2026-10-05T11:20:30.900Z");
    expect(durationSeconds(start, end)).toBe(8430);
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
