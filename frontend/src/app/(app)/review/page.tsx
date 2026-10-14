import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getAiProvider } from "@/features/ai/get-provider";
import { GoalSplit } from "@/features/review/goal-split";
import { goalTimes } from "@/features/review/goal-times";
import { loadPeriodData } from "@/features/review/period-data";
import {
  closedPeriods,
  recentWeeks,
  type PeriodKind,
} from "@/features/review/periods";
import {
  getLatestReport,
  listUnwrittenReports,
  type StoredReport,
} from "@/features/review/queries";
import { ReportPanel } from "@/features/review/report-panel";
import { ReportTabs } from "@/features/review/report-tabs";
import { reportStatus } from "@/features/review/status";
import { WeekChart } from "@/features/review/week-chart";
import { formatDuration } from "@/features/sessions/duration";
import { getTimeZone } from "@/features/timezone/time-zone";
import { percent } from "@/features/work/allocation";

export const metadata: Metadata = { title: "Review · FocusTrack" };

const PREVIOUS_WEEKS = 4;

export default async function ReviewPage() {
  const now = new Date();
  const timeZone = await getTimeZone();
  const weeks = recentWeeks(now, timeZone, PREVIOUS_WEEKS);
  const [data, day, week, month, unwritten] = await Promise.all([
    loadPeriodData(weeks, timeZone),
    getLatestReport("day"),
    getLatestReport("week"),
    getLatestReport("month"),
    listUnwrittenReports(),
  ]);
  const thisWeek = data.stats.at(-1)!;
  const thisWeekStart = weeks.at(-1)!.start;
  const aiConfigured = getAiProvider() !== null;
  const panel = (kind: PeriodKind, report: StoredReport | null) => (
    <ReportPanel
      kind={kind}
      report={report}
      status={reportStatus(
        kind,
        closedPeriods(kind, now, timeZone, 1)[0].startKey,
        report && report.periodStart,
        unwritten,
        now,
      )}
      aiConfigured={aiConfigured}
      now={now}
      timeZone={timeZone}
    />
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-8 sm:py-12">
      <PageHeader
        title="Review"
        description={
          thisWeek.totalSeconds === 0
            ? "Nothing tracked this week yet."
            : `This week so far: ${formatDuration(thisWeek.totalSeconds)} over ${thisWeek.activeDays} ${thisWeek.activeDays === 1 ? "day" : "days"}, ${percent(thisWeek.executionSeconds, thisWeek.totalSeconds)}% execution, ${percent(thisWeek.servingSeconds, thisWeek.totalSeconds)}% on projects that serve a goal.`
        }
      />

      <section aria-labelledby="weeks-heading" className="flex flex-col gap-5">
        <h2 id="weeks-heading" className="text-xl font-semibold tracking-tight">
          Five weeks
        </h2>
        <WeekChart stats={data.stats} />
      </section>

      <section aria-labelledby="ai-heading" className="flex flex-col gap-5">
        <h2 id="ai-heading" className="text-xl font-semibold tracking-tight">
          AI reports
        </h2>
        <ReportTabs
          panels={{
            day: panel("day", day),
            week: panel("week", week),
            month: panel("month", month),
          }}
        />
      </section>

      <section aria-labelledby="goals-heading" className="flex flex-col gap-3">
        <h2 id="goals-heading" className="text-xl font-semibold tracking-tight">
          Where this week went
        </h2>
        <GoalSplit
          rows={goalTimes(
            data.spans.filter(
              (span) => new Date(span.startedAt) >= thisWeekStart,
            ),
            data.categories,
            data.goals,
            data.projects,
          )}
        />
      </section>
    </main>
  );
}
