import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDuration } from "@/features/sessions/duration";
import { dayLabel } from "@/features/sessions/history";
import { dismissNudge } from "./actions";
import { revisitKey } from "./dismissals";
import { NudgeCard } from "./nudge-card";
import type { RevisitNudge } from "./revisit";

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
      className={cn("flex flex-col gap-3", className)}
    >
      {nudges.map((nudge) => (
        <NudgeCard
          key={nudge.projectId}
          icon={<RotateCcw aria-hidden />}
          title={`No ${nudge.projectName} for ${nudge.daysSince} days`}
          actions={
            <>
              <Link
                href={`/?project=${nudge.projectId}&category=${nudge.categoryId}`}
                className={buttonVariants({
                  size: "lg",
                  className: "h-9 px-3.5",
                })}
              >
                Pick it back up
              </Link>
              <form action={dismissNudge.bind(null, revisitKey(nudge))}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="lg"
                  className="h-9 px-3.5"
                >
                  Dismiss
                </Button>
              </form>
            </>
          }
        >
          {nudge.sessionCount} sessions over {nudge.activeDays} days (
          {formatDuration(nudge.workedSeconds)}), last on{" "}
          {dayLabel(nudge.lastDayKey, now, timeZone)}. Archive it if you have
          moved on.
        </NudgeCard>
      ))}
    </section>
  );
}
