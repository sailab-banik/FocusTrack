import { describe, expect, it } from "vitest";
import { reportStatus, type UnwrittenReport } from "./status";

const now = new Date("2026-10-14T06:00:00Z");
const claimedAgo = (minutes: number): UnwrittenReport => ({
  kind: "day",
  periodStart: "2026-10-13",
  claimedAt: new Date(now.getTime() - minutes * 60_000).toISOString(),
});

describe("reportStatus", () => {
  it("is written when the newest report covers the last period", () => {
    expect(reportStatus("day", "2026-10-13", "2026-10-13", [], now)).toBe(
      "written",
    );
  });

  it("is none when the last period was never claimed", () => {
    expect(reportStatus("day", "2026-10-13", "2026-10-12", [], now)).toBe(
      "none",
    );
    expect(reportStatus("day", "2026-10-13", null, [], now)).toBe("none");
  });

  it("is writing while the claim is fresh", () => {
    expect(
      reportStatus("day", "2026-10-13", null, [claimedAgo(1)], now),
    ).toBe("writing");
  });

  it("is failed once the claim has gone stale", () => {
    expect(
      reportStatus("day", "2026-10-13", null, [claimedAgo(4)], now),
    ).toBe("failed");
  });

  it("ignores claims for another kind or an earlier period", () => {
    const others: UnwrittenReport[] = [
      { ...claimedAgo(1), kind: "week" },
      { ...claimedAgo(1), periodStart: "2026-10-12" },
    ];
    expect(reportStatus("day", "2026-10-13", null, others, now)).toBe("none");
  });
});
