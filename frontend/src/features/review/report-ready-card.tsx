import Link from "next/link";
import { cookies } from "next/headers";
import { parseSeenAt, reportNotices, REPORTS_SEEN_COOKIE } from "./notices";
import type { PeriodKind } from "./periods";
import { getLatestReport, listRecentReports } from "./queries";

const LABELS: Record<PeriodKind, string> = {
  day: "New · daily report",
  week: "New · weekly report",
  month: "New · monthly report",
};

/** The newest unread report's headline, on the Today page. */
export async function ReportReadyCard() {
  const now = new Date();
  const [reports, store] = await Promise.all([
    listRecentReports(now),
    cookies(),
  ]);
  const seenAt = parseSeenAt(store.get(REPORTS_SEEN_COOKIE)?.value);
  const notice = reportNotices(reports, seenAt, now).find((n) => n.unread);
  if (!notice) return null;
  // A notice only exists for a written report.
  const report = (await getLatestReport(notice.kind))!;

  return (
    <Link
      href={`/insights?report=${notice.kind}`}
      className="relative flex flex-col gap-1.5 overflow-hidden rounded-3xl bg-indigo p-[22px] text-white shadow-[0_12px_30px_rgb(46_42_120/.25)]"
    >
      <svg
        aria-hidden
        viewBox="0 0 120 90"
        className="absolute -top-1.5 -right-1.5 h-[90px] w-[120px]"
      >
        <circle cx="80" cy="34" r="20" fill="#FFEFB8" />
        <circle cx="90" cy="27" r="18" fill="#2E2A78" />
        <circle cx="30" cy="20" r="1.6" fill="#FFFFFF" />
        <circle cx="52" cy="54" r="1.2" fill="#FFFFFF" />
        <circle cx="108" cy="62" r="1.4" fill="#FFFFFF" />
      </svg>
      <span className="text-xs font-semibold text-[#cfcbf5]">
        {LABELS[notice.kind]}
      </span>
      <span className="relative max-w-[240px] font-serif text-xl leading-[26px]">
        {report.headline}
      </span>
      <span className="mt-1.5 text-[13px] font-semibold text-peach">
        Read it →
      </span>
    </Link>
  );
}
