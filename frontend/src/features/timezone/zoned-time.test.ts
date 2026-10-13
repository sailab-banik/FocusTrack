import { describe, expect, it } from "vitest";
import {
  formatLocalTime,
  formatLongDate,
  fromLocalDateTimeInput,
  isValidTimeZone,
  localDayKey,
  minutesIntoDay,
  startOfLocalDay,
  toLocalDateTimeInput,
} from "./zoned-time";

describe("isValidTimeZone", () => {
  it("accepts IANA names and rejects junk", () => {
    expect(isValidTimeZone("Asia/Kolkata")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
  });
});

describe("localDayKey", () => {
  it("uses the day in the given timezone, not UTC", () => {
    const lateUtc = new Date("2026-10-09T20:00:00Z");
    expect(localDayKey(lateUtc, "UTC")).toBe("2026-10-09");
    expect(localDayKey(lateUtc, "Asia/Kolkata")).toBe("2026-10-10");
    expect(localDayKey(lateUtc, "America/Los_Angeles")).toBe("2026-10-09");
  });
});

describe("toLocalDateTimeInput", () => {
  it("formats wall-clock time in the timezone", () => {
    const instant = new Date("2026-10-09T04:30:00Z");
    expect(toLocalDateTimeInput(instant, "Asia/Kolkata")).toBe(
      "2026-10-09T10:00",
    );
    expect(toLocalDateTimeInput(instant, "UTC")).toBe("2026-10-09T04:30");
  });
});

describe("fromLocalDateTimeInput", () => {
  it("interprets the value in the timezone", () => {
    expect(
      fromLocalDateTimeInput("2026-10-09T10:00", "Asia/Kolkata")?.toISOString(),
    ).toBe("2026-10-09T04:30:00.000Z");
  });

  it("round-trips with toLocalDateTimeInput", () => {
    const instant = new Date("2026-07-01T15:45:00Z");
    const zone = "Europe/Berlin";
    expect(
      fromLocalDateTimeInput(toLocalDateTimeInput(instant, zone), zone),
    ).toEqual(instant);
  });

  it("handles both sides of a DST change", () => {
    // Europe/Berlin leaves summer time on 2026-10-25 at 03:00 local.
    expect(
      fromLocalDateTimeInput("2026-10-24T12:00", "Europe/Berlin")?.toISOString(),
    ).toBe("2026-10-24T10:00:00.000Z");
    expect(
      fromLocalDateTimeInput("2026-10-26T12:00", "Europe/Berlin")?.toISOString(),
    ).toBe("2026-10-26T11:00:00.000Z");
  });

  it("rejects malformed values", () => {
    expect(fromLocalDateTimeInput("2026-10-09 10:00", "UTC")).toBeNull();
    expect(fromLocalDateTimeInput("", "UTC")).toBeNull();
  });
});

describe("formatLocalTime", () => {
  it("formats 24-hour wall-clock time in the timezone", () => {
    const instant = new Date("2026-10-09T18:05:00Z");
    expect(formatLocalTime(instant, "UTC")).toBe("18:05");
    expect(formatLocalTime(instant, "Asia/Kolkata")).toBe("23:35");
  });
});

describe("minutesIntoDay", () => {
  it("counts minutes from local midnight", () => {
    // 09:00 UTC is 14:30 in Kolkata.
    expect(
      minutesIntoDay(new Date("2026-10-09T09:00:30Z"), "Asia/Kolkata"),
    ).toBe(870.5);
  });
});

describe("startOfLocalDay", () => {
  it("returns local midnight as an instant", () => {
    // Midnight in Kolkata is 18:30 UTC the day before.
    expect(
      startOfLocalDay(new Date("2026-10-09T09:00:00Z"), "Asia/Kolkata"),
    ).toEqual(new Date("2026-10-08T18:30:00Z"));
  });

  it("uses the local date, not the UTC one", () => {
    // 20:00 UTC on the 9th is already the 10th in Kolkata.
    expect(
      startOfLocalDay(new Date("2026-10-09T20:00:00Z"), "Asia/Kolkata"),
    ).toEqual(new Date("2026-10-09T18:30:00Z"));
  });
});

describe("formatLongDate", () => {
  it("names the local date, not the UTC one", () => {
    // 20:00 UTC on the 13th is already the 14th in Kolkata.
    expect(
      formatLongDate(new Date("2026-10-13T20:00:00Z"), "Asia/Kolkata"),
    ).toBe("Wednesday, October 14");
  });
});
