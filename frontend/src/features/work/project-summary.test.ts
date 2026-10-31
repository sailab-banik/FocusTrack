import { describe, expect, it } from "vitest";
import { lastSessionLine, summarizeProjects } from "./project-summary";

// A Wednesday.
const NOW = new Date("2026-10-14T12:00:00Z");

function span(startedAt: string, minutes: number, outcome: string | null) {
  return {
    projectId: "p",
    startedAt,
    endedAt: new Date(Date.parse(startedAt) + minutes * 60_000).toISOString(),
    pausedSeconds: 0,
    outcome,
  };
}

describe("summarizeProjects", () => {
  it("counts only time since Monday as this week", () => {
    const summary = summarizeProjects(
      [
        span("2026-10-11T23:00:00Z", 30, "Sunday"),
        span("2026-10-12T00:30:00Z", 20, "Monday"),
        span("2026-10-14T09:00:00Z", 10, "Today"),
      ],
      NOW,
      "UTC",
    ).get("p")!;
    expect(summary.weekSeconds).toBe(30 * 60);
  });

  it("uses the local day to decide the week", () => {
    const summary = summarizeProjects(
      [span("2026-10-11T23:00:00Z", 30, null)],
      NOW,
      "Asia/Kolkata",
    ).get("p")!;
    expect(summary.weekSeconds).toBe(30 * 60);
    expect(summary.lastDayKey).toBe("2026-10-12");
  });

  it("keeps the newest comment, skipping sessions without one", () => {
    const summary = summarizeProjects(
      [
        span("2026-10-14T09:00:00Z", 10, null),
        span("2026-10-13T09:00:00Z", 10, "Shipped it."),
      ],
      NOW,
      "UTC",
    ).get("p")!;
    expect(summary.lastComment).toBe("Shipped it.");
    expect(summary.lastDayKey).toBe("2026-10-14");
  });
});

describe("lastSessionLine", () => {
  it("says how recent the work is", () => {
    expect(lastSessionLine("2026-10-14", NOW, "UTC")).toBe("Last session today");
    expect(lastSessionLine("2026-10-13", NOW, "UTC")).toBe(
      "Last session yesterday",
    );
    expect(lastSessionLine("2026-10-09", NOW, "UTC")).toBe(
      "Untouched for 5 days",
    );
    expect(lastSessionLine(undefined, NOW, "UTC")).toBe(
      "No sessions in the last 4 weeks",
    );
  });
});
