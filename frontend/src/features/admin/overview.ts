import type { CategoryKind } from "@/features/categories/category-input";
import type { PeriodKind } from "@/features/review/periods";
import { sessionSeconds } from "@/features/sessions/duration";

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type AdminSession = {
  userId: string;
  categoryId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
};

export type AdminReport = {
  userId: string;
  kind: PeriodKind;
  model: string | null;
  claimedAt: string;
  writtenAt: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  writeMs: number | null;
  attempts: number;
  lastError: string | null;
  lastFailedAt: string | null;
};

export type UserStatus = "New" | "Active" | "Quiet" | null;

export type TypeTotals = { count: number; input: number; output: number };

export type OverviewDay = {
  dayKey: string;
  active: number;
  reports: Record<PeriodKind, TypeTotals>;
};

export type OverviewUser = {
  id: string;
  name: string;
  maskedEmail: string;
  joined: string;
  lastActive: string | null;
  sessions: number;
  executionPercent: number | null;
  reports: number;
  input: number;
  output: number;
  status: UserStatus;
};

export type Overview = {
  range: Range;
  people: number;
  newPeople: number;
  activePeople: number;
  sessions: number;
  days: OverviewDay[];
  types: Record<PeriodKind, TypeTotals>;
  uncountedReports: number;
  users: OverviewUser[];
  health: {
    written: number;
    firstTryPercent: number | null;
    failedAttempts: number;
    medianWriteMs: number | null;
    peopleWithoutReports: number;
    failures: {
      at: string;
      kind: PeriodKind;
      reason: string;
      retriedAt: string | null;
    }[];
  };
};

const DAY_MS = 86_400_000;
const NEW_DAYS = 7;
const ACTIVE_DAYS = 7;
const QUIET_DAYS = 14;
const RECENT_FAILURES = 5;

function emptyTotals(): TypeTotals {
  return { count: 0, input: 0, output: 0 };
}

function dayKeyOf(iso: string): string {
  return iso.slice(0, 10);
}

/** a•••@gmail.com. The overview never needs someone's full address. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "•••";
  return `${email[0]}•••${email.slice(at)}`;
}

/**
 * New: joined in the last 7 days. Active: a session in the last 7. Quiet: none
 * for 14 or more, counting from joining if they never had one. Someone between
 * 7 and 14 days has no status yet.
 */
export function userStatus(
  createdAt: string,
  lastActiveAt: string | null,
  now: Date,
): UserStatus {
  const daysSince = (iso: string) => (now.getTime() - Date.parse(iso)) / DAY_MS;
  if (daysSince(createdAt) < NEW_DAYS) return "New";
  const idle = daysSince(lastActiveAt ?? createdAt);
  if (lastActiveAt && idle < ACTIVE_DAYS) return "Active";
  return idle >= QUIET_DAYS ? "Quiet" : null;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** The numbers for one date range. Days are UTC: it spans every user's zone. */
export function buildOverview(
  range: Range,
  input: {
    users: AdminUser[];
    kinds: Map<string, CategoryKind>;
    sessions: AdminSession[];
    reports: AdminReport[];
    now: Date;
  },
): Overview {
  const { now } = input;
  const dayKeys = Array.from({ length: range }, (_, index) =>
    new Date(now.getTime() - (range - 1 - index) * DAY_MS)
      .toISOString()
      .slice(0, 10),
  );
  const firstDay = dayKeys[0];
  const inRange = (iso: string) => dayKeyOf(iso) >= firstDay;

  const sessions = input.sessions.filter((s) => inRange(s.startedAt));
  const written = input.reports.filter(
    (r) => r.writtenAt !== null && inRange(r.writtenAt),
  );

  const days = new Map<string, OverviewDay & { people: Set<string> }>(
    dayKeys.map((dayKey) => [
      dayKey,
      {
        dayKey,
        active: 0,
        people: new Set(),
        reports: { day: emptyTotals(), week: emptyTotals(), month: emptyTotals() },
      },
    ]),
  );
  for (const session of sessions) {
    days.get(dayKeyOf(session.startedAt))?.people.add(session.userId);
  }

  const types = {
    day: emptyTotals(),
    week: emptyTotals(),
    month: emptyTotals(),
  };
  for (const report of written) {
    for (const totals of [
      types[report.kind],
      days.get(dayKeyOf(report.writtenAt!))?.reports[report.kind],
    ]) {
      if (!totals) continue;
      totals.count += 1;
      totals.input += report.inputTokens ?? 0;
      totals.output += report.outputTokens ?? 0;
    }
  }

  const users = input.users.map((user): OverviewUser => {
    const own = sessions.filter((s) => s.userId === user.id);
    const ownReports = written.filter((r) => r.userId === user.id);
    // From the whole load, so status does not change with the range on view.
    const lastActiveAt =
      input.sessions
        .filter((s) => s.userId === user.id)
        .map((s) => s.startedAt)
        .toSorted()
        .at(-1) ?? null;
    let total = 0;
    let execution = 0;
    for (const session of own) {
      const seconds = sessionSeconds(session);
      total += seconds;
      if (input.kinds.get(session.categoryId) === "execution") {
        execution += seconds;
      }
    }
    return {
      id: user.id,
      name: user.name,
      maskedEmail: maskEmail(user.email),
      joined: user.createdAt,
      lastActive: lastActiveAt,
      sessions: own.length,
      executionPercent:
        total === 0 ? null : Math.round((execution / total) * 100),
      reports: ownReports.length,
      input: ownReports.reduce((sum, r) => sum + (r.inputTokens ?? 0), 0),
      output: ownReports.reduce((sum, r) => sum + (r.outputTokens ?? 0), 0),
      status: userStatus(user.createdAt, lastActiveAt, now),
    };
  });

  const failed = input.reports.filter(
    (r) => r.lastFailedAt !== null && inRange(r.lastFailedAt),
  );

  return {
    range,
    people: input.users.length,
    newPeople: input.users.filter((u) => inRange(u.createdAt)).length,
    activePeople: new Set(sessions.map((s) => s.userId)).size,
    sessions: sessions.length,
    days: [...days.values()].map(({ people, ...day }) => ({
      ...day,
      active: people.size,
    })),
    types,
    uncountedReports: written.filter((r) => r.inputTokens === null).length,
    users,
    health: {
      written: written.length,
      firstTryPercent:
        written.length === 0
          ? null
          : Math.round(
              (written.filter((r) => r.attempts === 1).length /
                written.length) *
                100,
            ),
      failedAttempts: failed.length,
      medianWriteMs: median(
        written.flatMap((r) => (r.writeMs === null ? [] : [r.writeMs])),
      ),
      peopleWithoutReports: users.filter((u) => u.reports === 0).length,
      failures: failed
        .toSorted((a, b) => b.lastFailedAt!.localeCompare(a.lastFailedAt!))
        .slice(0, RECENT_FAILURES)
        .map((r) => ({
          at: r.lastFailedAt!,
          kind: r.kind,
          reason: r.lastError ?? "Unexpected error",
          retriedAt: r.writtenAt,
        })),
    },
  };
}

/** Dollars for a token count at per-million rates. */
export function tokenCost(
  input: number,
  output: number,
  rates: { input: number; output: number },
): number {
  return (input * rates.input + output * rates.output) / 1_000_000;
}
