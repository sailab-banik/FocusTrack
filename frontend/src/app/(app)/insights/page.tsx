import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getAiProvider } from "@/features/ai/get-provider";
import { DayHours } from "@/features/review/day-hours";
import {
  MonthHeatmap,
  WeekDaysChart,
  WhereTimeWent,
} from "@/features/review/insight-charts";
import {
  hourTimeline,
  inPeriod,
  monthCalendar,
  projectShares,
  weekBars,
} from "@/features/review/insights";
import {
  parseSeenAt,
  reportNotices,
  REPORTS_SEEN_COOKIE,
} from "@/features/review/notices";
import { loadPeriodData } from "@/features/review/period-data";
import {
  closedPeriods,
  currentPeriod,
  nextPeriodStartKey,
  periodFrom,
  periodLabel,
  type Period,
  type PeriodKind,
} from "@/features/review/periods";
import {
  getLatestReport,
  listRecentReports,
  listUnwrittenReports,
  type StoredReport,
} from "@/features/review/queries";
import { ReportPanel } from "@/features/review/report-panel";
import { ReportTabs } from "@/features/review/report-tabs";
import { reportStatus } from "@/features/review/status";
import { formatDuration } from "@/features/sessions/duration";
import { getTimeZone } from "@/features/timezone/time-zone";
import { percent } from "@/features/work/allocation";

export const metadata: Metadata = { title: "Insights · FocusTrack" };

function shortDate(dayKey: string): string {
  // Noon UTC keeps the calendar date stable when formatting as UTC.
  return new Date(`${dayKey}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

function longDay(dayKey: string): string {
  return new Date(`${dayKey}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
  });
}

function monthName(dayKey: string): string {
  return new Date(`${dayKey}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
  });
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export default async function InsightsPage() {
  const now = new Date();
  const timeZone = await getTimeZone();
  const [day, week, month, unwritten, recent, store] = await Promise.all([
    getLatestReport("day"),
    getLatestReport("week"),
    getLatestReport("month"),
    listUnwrittenReports(),
    listRecentReports(now),
    cookies(),
  ]);
  const aiConfigured = getAiProvider() !== null;
  const lastClosed = (kind: PeriodKind) =>
    closedPeriods(kind, now, timeZone, 1)[0];
  const thisWeekPeriod = currentPeriod("week", now, timeZone);

  // Each tab's charts follow its read. With no read yet, day and week show the
  // last finished one, and the month shows itself so far, as the design does.
  const shown: Record<PeriodKind, Period> = {
    day: day ? periodFrom("day", day.periodStart, timeZone) : lastClosed("day"),
    week: week
      ? periodFrom("week", week.periodStart, timeZone)
      : lastClosed("week"),
    month: month
      ? periodFrom("month", month.periodStart, timeZone)
      : currentPeriod("month", now, timeZone),
  };
  // loadPeriodData reads sessions from its first period, so oldest goes first.
  const periods = [shown.day, shown.week, shown.month, thisWeekPeriod].toSorted(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  const data = await loadPeriodData(periods, timeZone);
  const statsOf = (period: Period) => data.stats[periods.indexOf(period)];
  const projectNames = new Map(data.projects.map((p) => [p.id, p.name]));
  const categories = new Map(data.categories.map((c) => [c.id, c]));

  const thisWeek = statsOf(thisWeekPeriod);
  const unread = reportNotices(
    recent,
    parseSeenAt(store.get(REPORTS_SEEN_COOKIE)?.value),
    now,
  )
    .filter((notice) => notice.unread)
    .map((notice) => notice.kind);

  function panel(
    kind: PeriodKind,
    report: StoredReport | null,
    label: string,
    fallbackHeadline: string,
  ) {
    const closed = lastClosed(kind);
    const arrivalKey =
      kind === "month"
        ? nextPeriodStartKey("month", shown.month.startKey)
        : nextPeriodStartKey(kind, currentPeriod(kind, now, timeZone).startKey);
    return (
      <ReportPanel
        kind={kind}
        report={report}
        status={reportStatus(
          kind,
          closed.startKey,
          report && report.periodStart,
          unwritten,
          now,
        )}
        aiConfigured={aiConfigured}
        periodLabel={label}
        fallbackHeadline={fallbackHeadline}
        arrival={`Read arrives ${shortDate(arrivalKey)}`}
        now={now}
        timeZone={timeZone}
      />
    );
  }

  const daySpans = inPeriod(data.spans, shown.day);
  const dayStats = statsOf(shown.day);
  const dayTitle = longDay(shown.day.startKey);
  const weekSpans = inPeriod(data.spans, shown.week);
  const weekStats = statsOf(shown.week);
  const monthSpans = inPeriod(data.spans, shown.month);
  const monthStats = statsOf(shown.month);
  const monthTitle = monthName(shown.month.startKey);

  function summary(total: number, execution: number, days: number) {
    if (total === 0) return "nothing tracked";
    return `${formatDuration(total)} over ${plural(days, "day")}, ${percent(execution, total)}% execution`;
  }

  return (
    <main className="flex w-full max-w-[1160px] flex-col gap-[22px] px-4 pt-1 pb-8 md:pt-[26px] md:pr-7 md:pb-14 md:pl-2">
      <ReportTabs
        unread={unread}
        header={
          <div className="flex flex-col gap-1.5">
            <h1 className="font-serif text-[34px] leading-10 md:text-[40px] md:leading-[46px]">
              Insights
            </h1>
            <p className="text-[15px] text-ink-soft">
              {thisWeek.totalSeconds === 0
                ? "Nothing tracked this week yet."
                : `This week so far: ${summary(thisWeek.totalSeconds, thisWeek.executionSeconds, thisWeek.activeDays)}.`}
            </p>
          </div>
        }
        panels={{
          day: (
            <Layout
              read={panel(
                "day",
                day,
                periodLabel("day", shown.day.startKey, now, timeZone),
                dayStats.totalSeconds === 0
                  ? `Nothing tracked on ${dayTitle}.`
                  : `${dayTitle}: ${summary(dayStats.totalSeconds, dayStats.executionSeconds, 1).replace(" over 1 day", "")}.`,
              )}
            >
              <DayHours
                title={`Your ${dayTitle}`}
                summary={
                  dayStats.totalSeconds === 0
                    ? "nothing tracked"
                    : `${formatDuration(dayStats.totalSeconds)} · ${percent(dayStats.executionSeconds, dayStats.totalSeconds)}% execution`
                }
                timeline={hourTimeline(daySpans, timeZone)}
                projects={projectNames}
                categories={categories}
                timeZone={timeZone}
              />
            </Layout>
          ),
          week: (
            <Layout
              read={panel(
                "week",
                week,
                periodLabel("week", shown.week.startKey, now, timeZone),
                weekStats.totalSeconds === 0
                  ? "Nothing tracked that week."
                  : `${summary(weekStats.totalSeconds, weekStats.executionSeconds, weekStats.activeDays)}.`,
              )}
            >
              <WeekDaysChart
                days={weekBars(
                  shown.week.startKey,
                  weekSpans,
                  categories,
                  timeZone,
                )}
                total={weekStats.totalSeconds}
              />
              <WhereTimeWent
                title="Where the week went"
                shares={projectShares(weekSpans, categories)}
                projects={projectNames}
              />
            </Layout>
          ),
          month: (
            <Layout
              read={panel(
                "month",
                month,
                month
                  ? periodLabel("month", shown.month.startKey, now, timeZone)
                  : `${monthTitle} so far`,
                monthStats.totalSeconds === 0
                  ? `Nothing tracked in ${monthTitle} yet.`
                  : `${monthTitle} so far: ${summary(monthStats.totalSeconds, monthStats.executionSeconds, monthStats.activeDays)}.`,
              )}
            >
              <MonthHeatmap
                title={monthTitle}
                calendar={monthCalendar(
                  shown.month,
                  monthSpans,
                  categories,
                  now,
                  timeZone,
                )}
              />
              <WhereTimeWent
                title={`Where ${monthTitle} went`}
                shares={projectShares(monthSpans, categories)}
                projects={projectNames}
              />
            </Layout>
          ),
        }}
      />
    </main>
  );
}

function Layout({
  read,
  children,
}: {
  read: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
      {read}
      <aside className="flex min-w-0 flex-col gap-5">{children}</aside>
    </div>
  );
}
