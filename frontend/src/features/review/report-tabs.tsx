"use client";

import { useSearchParams } from "next/navigation";
import { cn } from "cn";
import { PERIOD_KINDS, type PeriodKind } from "./periods";

const LABELS: Record<PeriodKind, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

/**
 * Switches between the daily, weekly, and monthly read. The choice lives in
 * the `report` search param so a notification can link straight to one.
 */
export function ReportTabs({
  header,
  panels,
  unread,
}: {
  header: React.ReactNode;
  panels: Record<PeriodKind, React.ReactNode>;
  unread: PeriodKind[];
}) {
  const requested = useSearchParams().get("report");
  const kind = PERIOD_KINDS.find((option) => option === requested) ?? "week";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        {header}
        <div
          role="tablist"
          aria-label="Period"
          className="flex gap-1 rounded-full bg-paper p-1 shadow-[0_1px_2px_rgb(31_27_61/.05),0_4px_12px_rgb(46_42_120/.05)]"
        >
          {PERIOD_KINDS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={option === kind}
              // Updates the URL without a round trip to the server.
              onClick={() =>
                window.history.replaceState(null, "", `?report=${option}`)
              }
              className={cn(
                "flex h-11 cursor-pointer items-center gap-2 rounded-full px-[18px] text-sm font-semibold transition-colors md:h-[38px]",
                option === kind ? "bg-indigo text-white" : "text-ink-soft",
              )}
            >
              {LABELS[option]}
              {option !== kind && unread.includes(option) && (
                <span className="inline-flex h-[18px] items-center rounded-full bg-tangerine px-1.5 text-[10px] font-bold text-white">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" key={kind} className="contents">
        {panels[kind]}
      </div>
    </>
  );
}
