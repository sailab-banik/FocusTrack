import { CLAIM_TTL_MS } from "./claims";
import type { PeriodKind } from "./periods";

/** A report that was claimed and has not been written. */
export type UnwrittenReport = {
  kind: PeriodKind;
  periodStart: string;
  claimedAt: string;
};

/**
 * Where the report for the last closed period stands. "none" means it was
 * never claimed, which is what a period without finished sessions looks like.
 */
export type ReportStatus = "written" | "writing" | "failed" | "none";

export function reportStatus(
  kind: PeriodKind,
  lastStartKey: string,
  latestWrittenStartKey: string | null,
  unwritten: UnwrittenReport[],
  now: Date,
): ReportStatus {
  if (latestWrittenStartKey === lastStartKey) return "written";
  const claim = unwritten.find(
    (report) => report.kind === kind && report.periodStart === lastStartKey,
  );
  if (!claim) return "none";
  return Date.parse(claim.claimedAt) >= now.getTime() - CLAIM_TTL_MS
    ? "writing"
    : "failed";
}
