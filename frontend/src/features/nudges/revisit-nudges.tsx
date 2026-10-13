import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDuration } from "@/features/sessions/duration";
import { dayLabel } from "@/features/sessions/history";
import { dismissNudge } from "./actions";
import { revisitKey } from "./dismissals";
import type { RevisitNudge } from "./revisit";

// Compact rows under the start button: worth seeing, never in the way of
// starting what was already chosen.
export function RevisitNudges({
  nudges,
  now,
  timeZone,
  className,
}: {
  nudges: RevisitNudge[];
  now: Date;
  timeZone: string;
  className?: string;
}) {
  return (
    <section
      aria-label="Work to pick back up"
      className={cn("flex flex-col divide-y border-y", className)}
    >
      {nudges.map((nudge) => (
        <div key={nudge.projectId} className="flex gap-3 py-4">
          <RotateCcw
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold">
                No {nudge.projectName} for {nudge.daysSince} days
              </p>
              <p className="text-sm text-muted-foreground">
                {nudge.sessionCount} sessions over {nudge.activeDays} days (
                {formatDuration(nudge.workedSeconds)}), last on{" "}
                {dayLabel(nudge.lastDayKey, now, timeZone)}. Archive it if you
                have moved on.
              </p>
            </div>
            <div className="flex gap-1">
              <Link
                href={`/?project=${nudge.projectId}&category=${nudge.categoryId}`}
                className={buttonVariants({ variant: "outline" })}
              >
                Pick it back up
              </Link>
              <form action={dismissNudge.bind(null, revisitKey(nudge))}>
                <Button type="submit" variant="ghost">
                  Dismiss
                </Button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
