"use client";

import { Hourglass, TimerOff } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { NudgeCard } from "@/features/nudges/nudge-card";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { formatDuration } from "./duration";
import { STALE_AFTER_HOURS } from "./stale-session";
import type { ClosedSession } from "./actions";

const ACTION = "h-9 px-3.5";

function dayAndTime(iso: string, timeZone: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-US", { timeZone, weekday: "short" });
  return `${day} ${formatLocalTime(date, timeZone)}`;
}

/** Says what happened to a session left on, since it happened without the user. */
export function ClosedSessionCard({
  closed,
  timeZone,
  onDismiss,
}: {
  closed: ClosedSession;
  timeZone: string;
  onDismiss: () => void;
}) {
  const since = dayAndTime(closed.since, timeZone);
  const ok = (
    <Button variant="outline" size="lg" className={ACTION} onClick={onDismiss}>
      OK
    </Button>
  );

  if (closed.outcome === "save") {
    return (
      <NudgeCard
        icon={<Hourglass aria-hidden />}
        title="Saved a paused session"
        actions={
          <>
            <Link
              href={`/log/${closed.sessionId}`}
              className={buttonVariants({ variant: "outline", size: "lg", className: ACTION })}
            >
              Edit it
            </Link>
            {ok}
          </>
        }
      >
        {closed.line} was paused from {since} for over {STALE_AFTER_HOURS}{" "}
        hours, so it was saved as {formatDuration(closed.seconds)}, ending when
        you paused.
      </NudgeCard>
    );
  }

  return (
    <NudgeCard
      icon={<TimerOff aria-hidden />}
      title="Discarded a timer left on"
      actions={
        <>
          <Link
            href="/log/new"
            className={buttonVariants({ variant: "outline", size: "lg", className: ACTION })}
          >
            Log it by hand
          </Link>
          {ok}
        </>
      }
    >
      {closed.wasPaused
        ? `${closed.line} was paused from ${since} with no time worked, so there was nothing to save.`
        : `${closed.line} ran ${formatDuration(closed.seconds)} without a pause from ${since}. Over ${STALE_AFTER_HOURS} hours, a timer has almost always been left on, so it wasn't saved.`}
    </NudgeCard>
  );
}
