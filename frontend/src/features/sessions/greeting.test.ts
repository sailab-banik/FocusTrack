import { describe, expect, it } from "vitest";
import { dayLine, greeting, skyPhase, sunPosition } from "./greeting";

describe("skyPhase", () => {
  it("runs morning, afternoon sunset, then evening night", () => {
    expect(skyPhase(300)).toBe("morning");
    expect(skyPhase(719)).toBe("morning");
    expect(skyPhase(720)).toBe("afternoon");
    expect(skyPhase(1019)).toBe("afternoon");
    expect(skyPhase(1020)).toBe("evening");
    expect(skyPhase(120)).toBe("evening");
  });
});

describe("sunPosition", () => {
  it("is lowest at the ends of the day and highest midway", () => {
    expect(sunPosition(360)).toEqual({ x: 8, y: 78 });
    expect(sunPosition(840)).toEqual({ x: 50, y: 26 });
    expect(sunPosition(1320).x).toBeCloseTo(92);
    expect(sunPosition(1320).y).toBeCloseTo(78);
  });

  it("stays put outside the working day", () => {
    expect(sunPosition(0)).toEqual(sunPosition(360));
    expect(sunPosition(1439)).toEqual(sunPosition(1320));
  });
});

describe("greeting", () => {
  it("follows the local time", () => {
    expect(greeting(719, "")).toBe("Good morning.");
    expect(greeting(720, "")).toBe("Good afternoon.");
    expect(greeting(1020, "")).toBe("Good evening.");
  });

  it("uses the name when there is one", () => {
    expect(greeting(600, "Sam")).toBe("Good morning, Sam.");
  });
});

describe("dayLine", () => {
  it("says when nothing is tracked", () => {
    expect(dayLine(0, 0)).toBe("Nothing tracked yet today.");
  });

  it("names a day that was all one kind", () => {
    expect(dayLine(0, 5400)).toBe("1h 30m tracked so far, all of it preparation.");
    expect(dayLine(3600, 0)).toBe("1h 0m tracked so far, all of it execution.");
  });

  it("gives the execution share of a mixed day", () => {
    expect(dayLine(1800, 1800)).toBe("1h 0m tracked so far, 30m of it execution.");
  });
});
