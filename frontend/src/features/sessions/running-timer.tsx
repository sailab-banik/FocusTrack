"use client";

import { useEffect, useState, useTransition } from "react";
import { Coffee, Hourglass, Pause, Play, Square } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";
import { NudgeCard } from "@/features/nudges/nudge-card";
import { runningNudge } from "@/features/nudges/running";
import { pauseSession, resumeSession } from "./actions";
import {
  durationSeconds,
  formatClock,
  formatDuration,
  runningSeconds,
} from "./duration";
import { StopSessionForm } from "./stop-session-form";
import { TimerFace } from "./timer-face";

const SNOOZE_MS = 30 * 60_000;

export function RunningTimer({
  sessionId,
  startedAt,
  pausedAt,
  pausedSeconds,
  resumedAt,
  projectName,
  categoryName,
  kind,
}: {
  sessionId: string;
  startedAt: string;
  pausedAt: string | null;
  pausedSeconds: number;
  resumedAt: string | null;
  projectName: string;
  categoryName: string;
  kind: CategoryKind;
}) {
  const [now, setNow] = useState(() => new Date());
  // Set when Stop is tapped, so time spent writing the log is not counted.
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);
  const [switching, startSwitch] = useTransition();
  // "Keep going" quiets the break nudge for a while; a reload brings it back.
  const [snoozedUntil, setSnoozedUntil] = useState<Date | null>(null);

  useEffect(() => {
    if (stoppedAt) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [stoppedAt]);

  const elapsed = runningSeconds(
    { startedAt, pausedAt, pausedSeconds },
    stoppedAt ?? now,
  );

  const nudge =
    stoppedAt || (snoozedUntil && now < snoozedUntil)
      ? null
      : runningNudge({ startedAt, pausedAt, resumedAt }, now);

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
    <div data-kind={kind} className="flex flex-col gap-8">
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
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight font-stretch-[108%]">
            {projectName}
          </h1>
          <p className="flex items-center gap-2 text-muted-foreground">
            <KindMark kind={kind} />
            {categoryName}
            <span className="sr-only">({kind})</span>
          </p>
        </div>
        {stoppedAt ? (
          <p className="text-5xl leading-none font-bold text-muted-foreground tabular-nums font-stretch-[68%]">
            {formatClock(elapsed)}
          </p>
        ) : (
          pausedAt && (
            <p className="flex shrink-0 flex-col items-end gap-1 text-sm text-muted-foreground">
              Paused for
              <span
                className="text-3xl leading-none font-bold text-foreground tabular-nums font-stretch-[68%]"
                suppressHydrationWarning
              >
                {formatClock(
                  Math.max(0, durationSeconds(new Date(pausedAt), now)),
                )}
              </span>
            </p>
          )
        )}
      </div>
      {stoppedAt ? (
        <StopSessionForm
          sessionId={sessionId}
          stoppedAt={stoppedAt}
          onResume={() => {
            setNow(new Date());
            setStoppedAt(null);
          }}
        />
      ) : (
        <>
          <div className={cn("transition-opacity", pausedAt && "opacity-40")}>
            <TimerFace elapsedSeconds={elapsed} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pausedAt ? (
              <Button
                size="lg"
                variant="kind"
                className="h-14 rounded-xl text-base"
                disabled={switching}
                onClick={() => startSwitch(() => resumeSession(sessionId))}
              >
                <Play className="fill-current" />
                Resume
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-xl text-base"
                disabled={switching}
                onClick={() => startSwitch(() => pauseSession(sessionId))}
              >
                <Pause className="fill-current" />
                Pause
              </Button>
            )}
            <Button
              size="lg"
              variant={pausedAt ? "outline" : "default"}
              className="h-14 rounded-xl text-base"
              disabled={switching}
              onClick={() => setStoppedAt(new Date())}
            >
              <Square className="fill-current" />
              Stop session
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
