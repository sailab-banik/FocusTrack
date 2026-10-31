import { describe, expect, it } from "vitest";
import { emailInList } from "./email-list";
import {
  buildOverview,
  maskEmail,
  tokenCost,
  userStatus,
  type AdminReport,
} from "./overview";

const NOW = new Date("2026-10-31T12:00:00Z");

function ago(days: number): string {
  return new Date(NOW.getTime() - days * 86_400_000).toISOString();
}

function report(overrides: Partial<AdminReport>): AdminReport {
  return {
    userId: "a",
    kind: "day",
    model: "m",
    claimedAt: ago(1),
    writtenAt: ago(1),
    inputTokens: 1000,
    outputTokens: 100,
    writeMs: 4000,
    attempts: 1,
    lastError: null,
    lastFailedAt: null,
    ...overrides,
  };
}

function session(userId: string, days: number, categoryId = "build") {
  const startedAt = ago(days);
  return {
    userId,
    categoryId,
    startedAt,
    endedAt: new Date(Date.parse(startedAt) + 3_600_000).toISOString(),
    pausedSeconds: 0,
  };
}

const kinds = new Map([
  ["build", "execution" as const],
  ["learn", "preparation" as const],
]);
const users = [
  { id: "a", email: "avery@gmail.com", name: "Avery", createdAt: ago(60) },
  { id: "b", email: "ben@proton.me", name: "", createdAt: ago(2) },
];

describe("emailInList", () => {
  it("matches ignoring case and spaces", () => {
    expect(emailInList(" A@x.com, b@x.com ", "a@X.com")).toBe(true);
    expect(emailInList("a@x.com", "c@x.com")).toBe(false);
  });

  it("never matches an unset list or a blank email", () => {
    expect(emailInList(undefined, "a@x.com")).toBe(false);
    expect(emailInList("", "")).toBe(false);
    expect(emailInList("a@x.com,", "")).toBe(false);
  });
});

describe("maskEmail", () => {
  it("keeps only the first letter and the domain", () => {
    expect(maskEmail("avery@gmail.com")).toBe("a•••@gmail.com");
    expect(maskEmail("")).toBe("•••");
  });
});

describe("userStatus", () => {
  it("calls anyone who joined in the last 7 days new", () => {
    expect(userStatus(ago(2), null, NOW)).toBe("New");
    expect(userStatus(ago(2), ago(1), NOW)).toBe("New");
  });

  it("is active with a session in the last 7 days", () => {
    expect(userStatus(ago(60), ago(6), NOW)).toBe("Active");
  });

  it("is quiet after 14 days or more without one", () => {
    expect(userStatus(ago(60), ago(14), NOW)).toBe("Quiet");
    expect(userStatus(ago(60), null, NOW)).toBe("Quiet");
  });

  it("has no status between 7 and 14 days", () => {
    expect(userStatus(ago(60), ago(10), NOW)).toBeNull();
    expect(userStatus(ago(10), null, NOW)).toBeNull();
  });
});

describe("tokenCost", () => {
  it("prices tokens per million", () => {
    expect(tokenCost(1_000_000, 100_000, { input: 1.25, output: 10 })).toBe(2.25);
  });
});

describe("buildOverview", () => {
  const input = {
    users,
    kinds,
    now: NOW,
    sessions: [
      session("a", 1),
      session("a", 1, "learn"),
      session("b", 2),
      session("a", 20),
    ],
    reports: [
      report({ kind: "week", inputTokens: 5000, outputTokens: 500 }),
      report({ attempts: 2, lastError: "Provider timeout", lastFailedAt: ago(1) }),
      report({ inputTokens: null, outputTokens: null, writeMs: null }),
      report({
        writtenAt: null,
        lastError: "Rate limited by provider",
        lastFailedAt: ago(0.5),
      }),
      report({ writtenAt: ago(40), claimedAt: ago(40) }),
    ],
  };

  it("counts only the range on view", () => {
    const week = buildOverview(7, input);
    expect(week.days).toHaveLength(7);
    expect(week.sessions).toBe(3);
    expect(week.activePeople).toBe(2);
    expect(week.newPeople).toBe(1);
    expect(buildOverview(30, input).sessions).toBe(4);
  });

  it("counts a person once per day however many sessions they had", () => {
    const yesterday = buildOverview(7, input).days.at(-2)!;
    expect(yesterday.active).toBe(1);
  });

  it("totals tokens by report type, with no counts as zero", () => {
    const { types, uncountedReports } = buildOverview(7, input);
    expect(types.week).toEqual({ count: 1, input: 5000, output: 500 });
    expect(types.day).toEqual({ count: 2, input: 1000, output: 100 });
    expect(uncountedReports).toBe(1);
  });

  it("works out each person's execution share", () => {
    const [avery, ben] = buildOverview(7, input).users;
    expect(avery).toMatchObject({
      maskedEmail: "a•••@gmail.com",
      sessions: 2,
      executionPercent: 50,
      reports: 3,
      status: "Active",
    });
    expect(ben).toMatchObject({ executionPercent: 100, reports: 0, status: "New" });
  });

  it("reports health from attempts and failures", () => {
    const { health } = buildOverview(7, input);
    expect(health.written).toBe(3);
    expect(health.firstTryPercent).toBe(67);
    expect(health.failedAttempts).toBe(2);
    expect(health.medianWriteMs).toBe(4000);
    expect(health.peopleWithoutReports).toBe(1);
    expect(health.failures[0]).toMatchObject({
      reason: "Rate limited by provider",
      retriedAt: null,
    });
    expect(health.failures[1].retriedAt).not.toBeNull();
  });
});
