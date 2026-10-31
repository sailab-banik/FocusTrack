import { ArrowRight } from "lucide-react";
import { dayLabel } from "@/features/sessions/history";
import { formatLocalTime, localDayKey } from "@/features/timezone/zoned-time";
import type { PeriodKind } from "./periods";
import type { StoredReport } from "./queries";
import { ReportArt } from "./report-art";
import type { ReportStatus } from "./status";

const WORDS: Record<PeriodKind, { last: string; next: string }> = {
  day: { last: "yesterday", next: "Today's sessions are read tomorrow." },
  week: {
    last: "last week",
    next: "This week's sessions are read next week.",
  },
  month: {
    last: "last month",
    next: "This month's read is written the first time you open FocusTrack after it ends.",
  },
};

/** The read itself, or plainly what happens instead while there is none. */
export function ReportPanel({
  kind,
  report,
  status,
  aiConfigured,
  periodLabel,
  fallbackHeadline,
  arrival,
  now,
  timeZone,
}: {
  kind: PeriodKind;
  report: StoredReport | null;
  status: ReportStatus;
  aiConfigured: boolean;
  /** The period on view. */
  periodLabel: string;
  /** Straight from the sessions, shown until a read exists. */
  fallbackHeadline: string;
  /** e.g. "Read arrives Nov 1" */
  arrival: string;
  now: Date;
  timeZone: string;
}) {
  const words = WORDS[kind];
  const off = !report && status !== "writing" && !aiConfigured;
  const badge = report
    ? "AI-assisted read"
    : status === "writing"
      ? "Writing the read…"
      : off
        ? "AI reads are off"
        : arrival;

  return (
    <article className="ft-in flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-paper shadow-[0_1px_2px_rgb(31_27_61/.05),0_16px_40px_rgb(46_42_120/.08)]">
      <ReportArt kind={kind} />
      <div className="flex flex-col gap-5 px-5 pt-6 pb-6 md:px-8 md:pt-7 md:pb-[30px]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-sm font-semibold text-ink-soft">
            {periodLabel}
          </span>
          <span
            role={status === "writing" ? "status" : undefined}
            className="inline-flex min-h-[26px] items-center rounded-full bg-wash px-2.5 text-xs font-semibold text-ink-soft"
          >
            {badge}
          </span>
        </div>
        <h2 className="font-serif text-2xl leading-8 text-balance md:text-[30px] md:leading-[38px]">
          {report ? report.headline : fallbackHeadline}
        </h2>

        {status === "failed" && (
          <p className="rounded-[14px] bg-butter px-3.5 py-3 text-sm text-[#6b4e00]">
            The read for {words.last} could not be written. It is tried again
            the next time you open FocusTrack.
          </p>
        )}

        {report ? (
          <>
            <ul className="flex flex-col gap-3">
              {report.observations.map((observation) => (
                <li
                  key={observation.title}
                  className="flex flex-col gap-1 rounded-[18px] bg-mist px-[18px] py-4"
                >
                  <h3 className="text-[15px] font-semibold">
                    {observation.title}
                  </h3>
                  <p className="text-sm leading-[21px] text-pretty text-ink-soft">
                    {observation.evidence}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-3.5 rounded-[18px] bg-tangerine-soft px-5 py-[18px]">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-paper">
                <ArrowRight
                  aria-hidden
                  className="size-4 text-tangerine-text"
                />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-tangerine-text">
                  Next
                </span>
                <span className="font-serif text-lg leading-[25px]">
                  {report.nextAction}
                </span>
              </span>
            </div>
            <WrittenLine report={report} now={now} timeZone={timeZone} />
          </>
        ) : (
          <p className="text-xs leading-[18px] text-ink-muted">
            {off
              ? "These numbers come straight from your sessions. Everything else in FocusTrack works the same with AI off."
              : `These numbers come straight from your sessions. ${words.next}`}
          </p>
        )}
      </div>
    </article>
  );
}

function WrittenLine({
  report,
  now,
  timeZone,
}: {
  report: StoredReport;
  now: Date;
  timeZone: string;
}) {
  const writtenAt = new Date(report.writtenAt);
  const day = dayLabel(localDayKey(writtenAt, timeZone), now, timeZone);
  const writtenOn =
    day === "Today" || day === "Yesterday" ? day.toLowerCase() : `on ${day}`;

  return (
    <p className="text-xs leading-[18px] text-ink-muted">
      An AI-assisted read, not an objective measurement. Written {writtenOn} at{" "}
      {formatLocalTime(writtenAt, timeZone)} by {report.model}.
    </p>
  );
}
