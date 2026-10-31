import Link from "next/link";
import { ProjectTile } from "@/features/projects/project-tile";
import { formatDuration } from "@/features/sessions/duration";
import { dayLabel } from "@/features/sessions/history";
import { dismissNudge } from "./actions";
import { revisitKey } from "./dismissals";
import type { RevisitNudge } from "./revisit";

export function RevisitNudges({
  nudges,
  now,
  timeZone,
}: {
  nudges: RevisitNudge[];
  now: Date;
  timeZone: string;
}) {
  return (
    <section aria-label="Work to pick back up" className="flex flex-col gap-3">
      {nudges.map((nudge) => (
        <div
          key={nudge.projectId}
          className="flex flex-col gap-3 rounded-3xl bg-mint p-[22px] text-[#2c4a3e]"
        >
          <div className="flex items-center gap-2.5">
            <ProjectTile
              id={nudge.projectId}
              name={nudge.projectName}
              size="sm"
            />
            <p className="text-[15px] font-semibold text-ink">
              No {nudge.projectName} for {nudge.daysSince} days
            </p>
          </div>
          <p className="text-sm leading-[21px]">
            {nudge.sessionCount} sessions over {nudge.activeDays} days (
            {formatDuration(nudge.workedSeconds)}), last on{" "}
            {dayLabel(nudge.lastDayKey, now, timeZone)}. Archive it if you have
            moved on.
          </p>
          <div className="flex gap-2">
            <Link
              href={`/?project=${nudge.projectId}&category=${nudge.categoryId}`}
              className="flex h-11 items-center rounded-xl bg-ink px-3.5 text-[13px] font-semibold text-white"
            >
              Pick it back up
            </Link>
            <form action={dismissNudge.bind(null, revisitKey(nudge))}>
              <button
                type="submit"
                className="h-11 cursor-pointer rounded-xl px-3 text-[13px] font-semibold"
              >
                Not now
              </button>
            </form>
          </div>
        </div>
      ))}
    </section>
  );
}
