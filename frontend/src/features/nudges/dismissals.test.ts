import { describe, expect, it } from "vitest";
import {
  isNudgeKey,
  parseDismissed,
  revisitKey,
  withDismissed,
} from "./dismissals";

const PROJECT = "3f2b8c1e-5d4a-4f6b-9a7c-1e2d3c4b5a69";
const KEY = `${PROJECT}:2026-10-06`;

describe("nudge dismissals", () => {
  it("keys a lapse by project and last day", () => {
    expect(revisitKey({ projectId: PROJECT, lastDayKey: "2026-10-06" })).toBe(
      KEY,
    );
    expect(isNudgeKey(KEY)).toBe(true);
  });

  it("drops anything in the cookie that is not a key", () => {
    expect(parseDismissed(`${KEY},<script>,${PROJECT}:nope,`)).toEqual([KEY]);
    expect(parseDismissed(undefined)).toEqual([]);
  });

  it("adds a key once", () => {
    expect(withDismissed([KEY], KEY)).toEqual([KEY]);
  });

  it("keeps only the 30 most recent keys", () => {
    const old = Array.from(
      { length: 30 },
      (_, day) => `${PROJECT}:2026-09-${String(day + 1).padStart(2, "0")}`,
    );
    const kept = withDismissed(old, KEY);
    expect(kept).toHaveLength(30);
    expect(kept.at(-1)).toBe(KEY);
    expect(kept).not.toContain(old[0]);
  });
});
