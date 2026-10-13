import { CLAIM_TTL_MS } from "./claims";
import { PERIOD_KINDS, type PeriodKind } from "./periods";

// Notifications are not stored. A notice is a report written within this
// window, so it expires by itself and there is nothing to clean up. What has
// been seen is one timestamp in a cookie: a per-device convenience, not data
// worth a table.
export const NOTICE_TTL_MS = 7 * 86_400_000;
export const REPORTS_SEEN_COOKIE = "reports_seen_at";

export type RecentReport = {
  kind: PeriodKind;
  periodStart: string;
  writtenAt: string | null;
  claimedAt: string;
};

export type ReportNotice = {
  kind: PeriodKind;
  periodStart: string;
  unread: boolean;
};

/** When the notices were last seen, in ms; 0 when they never were. */
export function parseSeenAt(cookieValue: string | undefined): number {
  const seenAt = Number(cookieValue);
  return Number.isFinite(seenAt) && seenAt > 0 ? seenAt : 0;
}

/**
 * The newest report of each kind written within the window, daily first.
 * Only the newest counts because it is the one the Review page shows.
 */
export function reportNotices(
  reports: RecentReport[],
  seenAt: number,
  now: Date,
): ReportNotice[] {
  const expiredBefore = now.getTime() - NOTICE_TTL_MS;
  return PERIOD_KINDS.flatMap((kind) => {
    const newest = reports
      .filter((report) => report.kind === kind && report.writtenAt !== null)
      .sort((a, b) => b.periodStart.localeCompare(a.periodStart))[0];
    if (!newest) return [];
    const writtenAt = Date.parse(newest.writtenAt!);
    if (writtenAt < expiredBefore) return [];
    return [
      { kind, periodStart: newest.periodStart, unread: writtenAt > seenAt },
    ];
  });
}

/** Whether a report is claimed and still being written. */
export function anyBeingWritten(reports: RecentReport[], now: Date): boolean {
  return reports.some(
    (report) =>
      report.writtenAt === null &&
      Date.parse(report.claimedAt) >= now.getTime() - CLAIM_TTL_MS,
  );
}
