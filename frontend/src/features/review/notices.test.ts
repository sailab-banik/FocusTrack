import { describe, expect, it } from "vitest";
import { anyBeingWritten, parseSeenAt, reportNotices } from "./notices";

const now = new Date("2026-10-14T10:00:00Z");

function written(
  kind: "day" | "week" | "month",
  periodStart: string,
  writtenAt: string,
) {
  return { kind, periodStart, writtenAt, claimedAt: writtenAt };
}

describe("parseSeenAt", () => {
  it("reads the stored timestamp", () => {
    expect(parseSeenAt("1791900000000")).toBe(1791900000000);
  });

  it("treats a missing or malformed value as never seen", () => {
    expect(parseSeenAt(undefined)).toBe(0);
    expect(parseSeenAt("yesterday")).toBe(0);
    expect(parseSeenAt("-5")).toBe(0);
  });
});

describe("reportNotices", () => {
  it("lists the newest report of each kind, daily first", () => {
    const notices = reportNotices(
      [
        written("week", "2026-10-05", "2026-10-12T04:00:00Z"),
        written("day", "2026-10-12", "2026-10-13T04:00:00Z"),
        written("day", "2026-10-13", "2026-10-14T04:00:00Z"),
      ],
      0,
      now,
    );
    expect(notices).toEqual([
      { kind: "day", periodStart: "2026-10-13", unread: true },
      { kind: "week", periodStart: "2026-10-05", unread: true },
    ]);
  });

  it("drops reports written more than a week ago", () => {
    expect(
      reportNotices(
        [written("month", "2026-09-01", "2026-10-06T04:00:00Z")],
        0,
        now,
      ),
    ).toEqual([]);
  });

  it("leaves out reports still being written", () => {
    const claim = {
      kind: "day" as const,
      periodStart: "2026-10-13",
      writtenAt: null,
      claimedAt: "2026-10-14T09:59:00Z",
    };
    expect(reportNotices([claim], 0, now)).toEqual([]);
  });

  it("marks only reports written since the last look as unread", () => {
    const seenAt = Date.parse("2026-10-13T12:00:00Z");
    const notices = reportNotices(
      [
        written("week", "2026-10-05", "2026-10-12T04:00:00Z"),
        written("day", "2026-10-13", "2026-10-14T04:00:00Z"),
      ],
      seenAt,
      now,
    );
    expect(notices.map((notice) => [notice.kind, notice.unread])).toEqual([
      ["day", true],
      ["week", false],
    ]);
  });
});

describe("anyBeingWritten", () => {
  const claim = (claimedAt: string) => ({
    kind: "day" as const,
    periodStart: "2026-10-13",
    writtenAt: null,
    claimedAt,
  });

  it("is true for a fresh unwritten claim", () => {
    expect(anyBeingWritten([claim("2026-10-14T09:59:00Z")], now)).toBe(true);
  });

  it("is false once the claim has gone stale", () => {
    expect(anyBeingWritten([claim("2026-10-14T09:50:00Z")], now)).toBe(false);
  });

  it("is false for written reports", () => {
    expect(
      anyBeingWritten(
        [written("day", "2026-10-13", "2026-10-14T09:59:30Z")],
        now,
      ),
    ).toBe(false);
  });
});
