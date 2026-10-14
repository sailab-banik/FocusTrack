import { dayLabel } from "@/features/sessions/history";
import { formatLocalTime, localDayKey } from "@/features/timezone/zoned-time";
import { periodLabel, type PeriodKind } from "./periods";
import type { StoredReport } from "./queries";
import type { ReportStatus } from "./status";

const HOW_REPORTS_WORK =
  "Reports are written automatically, once for each day, week, and month with finished sessions, the next time you open the app. Each one sends that period's totals, your goal and project names, and session outcomes to the AI provider. Notes and descriptions stay here.";

const WORDS: Record<PeriodKind, { last: string; next: string }> = {
  day: { last: "yesterday", next: "Today's sessions are reported tomorrow." },
  week: {
    last: "last week",
    next: "This week's sessions are reported next week.",
  },
  month: {
    last: "last month",
    next: "This month's sessions are reported next month.",
  },
};

export function ReportPanel({
  kind,
  report,
  status,
  aiConfigured,
  now,
  timeZone,
}: {
  kind: PeriodKind;
  report: StoredReport | null;
  status: ReportStatus;
  aiConfigured: boolean;
  now: Date;
  timeZone: string;
}) {
  const words = WORDS[kind];

  if (!report && status !== "writing" && !aiConfigured) {
    return (
      <p className="max-w-prose text-muted-foreground">
        AI reports are off. Set{" "}
        <code className="rounded-sm bg-muted px-1 py-0.5 text-sm text-foreground">
          OPENAI_API_KEY
        </code>{" "}
        on the server to turn them on. The numbers on this page work without
        it.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {status === "writing" && (
        <p role="status" className="text-muted-foreground">
          Writing the report for {words.last}…
        </p>
      )}
      {status === "failed" && (
        <p className="max-w-prose text-muted-foreground">
          The report for {words.last} could not be written. It is tried again
          the next time you open the app.
        </p>
      )}
      {status === "none" && aiConfigured && (
        <p className="max-w-prose text-muted-foreground">
          No report for {words.last}: no finished session started then.{" "}
          {words.next}
        </p>
      )}
      {report && (
        <ReportArticle
          kind={kind}
          report={report}
          now={now}
          timeZone={timeZone}
        />
      )}
      {aiConfigured && (
        <p className="max-w-prose text-xs text-muted-foreground">
          {HOW_REPORTS_WORK}
        </p>
      )}
    </div>
  );
}

function ReportArticle({
  kind,
  report,
  now,
  timeZone,
}: {
  kind: PeriodKind;
  report: StoredReport;
  now: Date;
  timeZone: string;
}) {
  const writtenAt = new Date(report.writtenAt);
  const day = dayLabel(localDayKey(writtenAt, timeZone), now, timeZone);
  const writtenOn =
    day === "Today" || day === "Yesterday" ? day.toLowerCase() : `on ${day}`;

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {periodLabel(kind, report.periodStart, now, timeZone)}
        </p>
        <p className="max-w-prose text-2xl leading-snug font-semibold tracking-tight text-balance font-stretch-[108%]">
          {report.headline}
        </p>
      </div>
      <ul className="flex flex-col divide-y border-y">
        {report.observations.map((observation) => (
          <li key={observation.title} className="flex flex-col gap-1 py-4">
            <h3 className="font-semibold">{observation.title}</h3>
            <p className="max-w-prose text-muted-foreground">
              {observation.evidence}
            </p>
          </li>
        ))}
      </ul>
      <p className="max-w-prose border-l-2 border-foreground pl-4">
        <span className="font-semibold">Next: </span>
        {report.nextAction}
      </p>
      <p className="text-sm text-muted-foreground">
        An AI-assisted read, not an objective measurement. Written {writtenOn}{" "}
        at {formatLocalTime(writtenAt, timeZone)} by {report.model}.
      </p>
    </article>
  );
}
