"use client";

import { useSearchParams } from "next/navigation";
import { PERIOD_KINDS, type PeriodKind } from "./periods";

const LABELS: Record<PeriodKind, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

/**
 * Switches between the daily, weekly, and monthly report. The choice lives in
 * the `report` search param so a notification can link straight to one.
 */
export function ReportTabs({
  panels,
}: {
  panels: Record<PeriodKind, React.ReactNode>;
}) {
  const requested = useSearchParams().get("report");
  const kind = PERIOD_KINDS.find((option) => option === requested) ?? "day";

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Report period" className="flex gap-2">
        {PERIOD_KINDS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === kind}
            // Updates the URL without a round trip to the server.
            onClick={() =>
              window.history.replaceState(null, "", `?report=${option}`)
            }
            className="h-10 rounded-full border border-input bg-card px-4 text-sm transition-colors outline-none select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {LABELS[option]}
          </button>
        ))}
      </div>
      {panels[kind]}
    </div>
  );
}
