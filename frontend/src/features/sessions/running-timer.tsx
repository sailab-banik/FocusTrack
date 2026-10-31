"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Coffee, Hourglass, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";
import { NudgeCard } from "@/features/nudges/nudge-card";
import { runningNudge } from "@/features/nudges/running";
import { ProjectTile } from "@/features/projects/project-tile";
import { formatLocalTime } from "@/features/timezone/zoned-time";
import { pauseSession, resumeSession } from "./actions";
import {
  durationSeconds,
  formatClock,
  formatDuration,
  pausedSecondsAfterResume,
  runningSeconds,
} from "./duration";
import { DiscardSessionButton } from "./discard-session-button";
import { StopDialog } from "./stop-dialog";
import { TimerFace } from "./timer-face";

const SNOOZE_MS = 30 * 60_000;

export function RunningTimer({
  sessionId,
  startedAt,
  pausedAt,
  pausedSeconds,
  resumedAt,
  projectId,
  projectName,
  timeZone,
  categoryName,
  kind,
  onSaved,
}: {
  sessionId: string;
  startedAt: string;
  pausedAt: string | null;
  pausedSeconds: number;
  resumedAt: string | null;
  projectId: string;
  projectName: string;
  timeZone: string;
  categoryName: string;
  kind: CategoryKind;
  /** Called with a line describing the session, once it has been saved. */
  onSaved: (line: string) => void;
}) {
  const [now, setNow] = useState(() => new Date());
  // Set when Stop is tapped, so time spent writing the log is not counted.
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);
  const [switching, startSwitch] = useTransition();
  // Shows a pause or resume as soon as it is tapped. The server's values
  // replace it when the action's refresh lands, or undo it if the action fails.
  const [pause, setOptimisticPause] = useOptimistic({
    pausedAt,
    pausedSeconds,
    resumedAt,
  });
  // "Keep going" quiets the break nudge for a while; a reload brings it back.
  const [snoozedUntil, setSnoozedUntil] = useState<Date | null>(null);

  useEffect(() => {
    if (stoppedAt) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [stoppedAt]);

  const elapsed = runningSeconds(
    { startedAt, pausedAt: pause.pausedAt, pausedSeconds: pause.pausedSeconds },
    stoppedAt ?? now,
  );

  const nudge =
    stoppedAt || (snoozedUntil && now < snoozedUntil)
      ? null
      : runningNudge(
          { startedAt, pausedAt: pause.pausedAt, resumedAt: pause.resumedAt },
          now,
        );

  function togglePause() {
    // Not `disabled`: the button has already flipped, and dimming it would
    // read as loading. Taps are ignored until the save lands instead.
    if (switching) return;
    const at = new Date();
    setNow(at);
    startSwitch(async () => {
      if (pause.pausedAt) {
        setOptimisticPause({
          pausedAt: null,
          pausedSeconds: pausedSecondsAfterResume(
            { pausedAt: pause.pausedAt, pausedSeconds: pause.pausedSeconds },
            at,
          ),
          resumedAt: at.toISOString(),
        });
        await resumeSession(sessionId);
      } else {
        setOptimisticPause({ ...pause, pausedAt: at.toISOString() });
        await pauseSession(sessionId);
      }
    });
  }

  // The tab title is the one part of the app visible from another tab.
  const tabTitle =
    nudge && (nudge.type === "break" ? "Break due" : "Still paused");
  useEffect(() => {
    if (!tabTitle) return;
    const previous = document.title;
    document.title = `${tabTitle} · FocusTrack`;
    return () => {
      document.title = previous;
    };
  }, [tabTitle]);

  return (
    <div data-kind={kind} className="ft-in flex flex-col gap-4 md:gap-5">
      {nudge && (
        <div role="status">
          {nudge.type === "break" ? (
            <NudgeCard
              icon={<Coffee aria-hidden />}
              title={`${formatDuration(nudge.stretchSeconds)} without a pause`}
              actions={
                <Button
                  variant="outline"
                  size="lg"
                  className="h-9 px-3.5"
                  onClick={() =>
                    setSnoozedUntil(new Date(now.getTime() + SNOOZE_MS))
                  }
                >
                  Keep going
                </Button>
              }
            >
              Pause for a few minutes, or stop here and log what you have so
              far.
            </NudgeCard>
          ) : (
            <NudgeCard
              icon={<Hourglass aria-hidden />}
              title={`Paused for ${formatDuration(nudge.pausedSeconds)}`}
            >
              Resume, or stop the session. Stopping ends it at the moment you
              paused, so none of this break is counted.
            </NudgeCard>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProjectTile id={projectId} name={projectName} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="truncate text-base font-semibold md:text-[17px]">
              {projectName}
            </h2>
            <p className="hidden text-[13px] text-ink-muted md:block">
              {pause.pausedAt
                ? "Paused. Paused time isn’t counted."
                : `Started at ${formatLocalTime(new Date(startedAt), timeZone)}`}
            </p>
          </div>
        </div>
        <span className="inline-flex h-[30px] shrink-0 items-center gap-[7px] rounded-full bg-kind-soft px-3 text-[13px] font-semibold text-kind-text md:h-8">
          <KindMark kind={kind} className="size-2" />
          {categoryName}
          <span className="hidden md:inline">· {kind}</span>
          <span className="sr-only md:hidden">({kind})</span>
        </span>
      </div>
      {stoppedAt && (
        <StopDialog
          sessionId={sessionId}
          stoppedAt={stoppedAt}
          elapsedSeconds={elapsed}
          label={`${projectName} · ${categoryName} · ${formatDuration(elapsed)}`}
          kind={kind}
          onKeepGoing={() => {
            setNow(new Date());
            setStoppedAt(null);
          }}
          onSaved={() =>
            onSaved(`${formatDuration(elapsed)} of ${categoryName} on ${projectName}.`)
          }
        />
      )}
          <TimerFace elapsedSeconds={elapsed} paused={pause.pausedAt !== null}>
            {pause.pausedAt && (
              <span
                className="inline-flex h-[30px] items-center rounded-full bg-wash px-3 text-[13px] font-semibold text-ink-soft"
                suppressHydrationWarning
              >
                Paused ·{" "}
                {formatClock(
                  Math.max(0, durationSeconds(new Date(pause.pausedAt), now)),
                )}
              </span>
            )}
          </TimerFace>
          <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
            <Button
              variant="outline"
              className="h-14 flex-1 rounded-2xl border-line-strong text-base font-medium md:h-[50px] md:flex-none md:rounded-[14px] md:px-5 md:text-[15px]"
              aria-disabled={switching}
              onClick={togglePause}
            >
              {pause.pausedAt ? (
                <Play className="size-3 fill-current" />
              ) : (
                <Pause className="size-3 fill-current" />
              )}
              {pause.pausedAt ? "Resume" : "Pause"}
            </Button>
            <Button
              className="h-14 flex-[1.3] gap-2.5 rounded-2xl text-base font-semibold shadow-[0_8px_20px_rgb(46_42_120/.25)] md:h-[50px] md:flex-none md:rounded-[14px] md:px-[22px] md:text-[15px]"
              aria-disabled={switching}
              onClick={() => {
                if (!switching) setStoppedAt(new Date());
              }}
            >
              <Square className="size-2.5 fill-current" />
              <span className="md:hidden">Stop</span>
              <span className="hidden md:inline">Stop and add a comment</span>
            </Button>
            <div className="w-full md:ml-auto md:w-auto">
              <DiscardSessionButton
                sessionId={sessionId}
                elapsedSeconds={elapsed}
              />
            </div>
          </div>
    </div>
  );
}
