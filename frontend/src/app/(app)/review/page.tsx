import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getAiProvider } from "@/features/ai/get-provider";
import { getLatestReview } from "@/features/review/queries";
import { GoalSplit } from "@/features/review/goal-split";
import { goalTimes } from "@/features/review/goal-times";
import { ReviewPanel } from "@/features/review/review-panel";
import { WeekChart } from "@/features/review/week-chart";
import { loadWeekData } from "@/features/review/week-data";
import { formatDuration } from "@/features/sessions/duration";
import { getTimeZone } from "@/features/timezone/time-zone";
import { percent } from "@/features/work/allocation";

export const metadata: Metadata = { title: "Review · FocusTrack" };

export default async function ReviewPage() {
  const now = new Date();
  const timeZone = await getTimeZone();
  const data = await loadWeekData(now, timeZone);
  const review = await getLatestReview(data.currentWeek.startKey);
  const thisWeek = data.stats.at(-1)!;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-4 py-8 sm:py-12">
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
          AI review of this week
        </h2>
        <ReviewPanel
          review={review}
          aiConfigured={getAiProvider() !== null}
          hasSessions={thisWeek.sessionCount > 0}
          now={now}
          timeZone={timeZone}
        />
      </section>

      <section aria-labelledby="goals-heading" className="flex flex-col gap-3">
        <h2 id="goals-heading" className="text-xl font-semibold tracking-tight">
          Where this week went
        </h2>
        <GoalSplit
          rows={goalTimes(
            data.thisWeekSpans,
            data.categories,
            data.goals,
            data.projects,
          )}
        />
      </section>
    </main>
  );
}
