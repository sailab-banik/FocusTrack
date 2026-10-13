import { cookies } from "next/headers";
import { getTimeZone } from "@/features/timezone/time-zone";
import {
  anyBeingWritten,
  parseSeenAt,
  reportNotices,
  REPORTS_SEEN_COOKIE,
} from "./notices";
import { periodLabel, type PeriodKind } from "./periods";
import { listRecentReports } from "./queries";
import { ReportBell } from "./report-bell";
import { ReportPoller } from "./report-poller";

const TITLES: Record<PeriodKind, string> = {
  day: "Daily report",
  week: "Weekly report",
  month: "Monthly report",
};

/**
 * The header bell. While a report is being written it also keeps the page
 * refreshing, so the bell and the Review page pick the report up when it lands.
 */
export async function ReportNotifications() {
  const now = new Date();
  const [reports, store, timeZone] = await Promise.all([
    listRecentReports(now),
    cookies(),
    getTimeZone(),
  ]);
  const seenAt = parseSeenAt(store.get(REPORTS_SEEN_COOKIE)?.value);

  return (
    <>
      <ReportBell
        notices={reportNotices(reports, seenAt, now).map((notice) => ({
          kind: notice.kind,
          title: TITLES[notice.kind],
          period: periodLabel(notice.kind, notice.periodStart, now, timeZone),
          unread: notice.unread,
        }))}
      />
      {anyBeingWritten(reports, now) && <ReportPoller />}
    </>
  );
}
