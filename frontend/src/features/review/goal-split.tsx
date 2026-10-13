import { cn } from "cn";
import { formatDuration } from "@/features/sessions/duration";
import { totalSeconds } from "@/features/work/allocation";
import { TimeBar } from "@/features/work/time-bar";
import type { GoalTime } from "./goal-times";

/** This week's time per goal, on one scale, with unlinked time last. */
export function GoalSplit({ rows }: { rows: GoalTime[] }) {
  const maxSeconds = Math.max(1, ...rows.map((row) => totalSeconds(row.time)));

  return (
    <ul className="flex flex-col">
      {rows.map((row) => {
        const total = totalSeconds(row.time);
        return (
          <li
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-2.5 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_4.5rem]"
          >
            <span
              className={cn(
                "text-balance",
                row.servesGoal ? "font-medium" : "text-muted-foreground",
              )}
            >
              {row.label}
            </span>
            <TimeBar
              time={row.time}
              maxSeconds={maxSeconds}
              className="order-last col-span-full sm:order-none sm:col-span-1"
            />
            <span className="text-right text-sm font-medium tabular-nums">
              {formatDuration(total)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
