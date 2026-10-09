"use client";

import { useEffect, useState, useTransition } from "react";
import { Pause, Play, Square } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";
import { pauseSession, resumeSession } from "./actions";
import { durationSeconds, formatClock, runningSeconds } from "./duration";
import { StopSessionForm } from "./stop-session-form";
import { TimerFace } from "./timer-face";

export function RunningTimer({
  sessionId,
  startedAt,
  pausedAt,
  pausedSeconds,
  projectName,
  categoryName,
  kind,
}: {
  sessionId: string;
  startedAt: string;
  pausedAt: string | null;
  pausedSeconds: number;
  projectName: string;
  categoryName: string;
  kind: CategoryKind;
}) {
  const [now, setNow] = useState(() => new Date());
  // Set when Stop is tapped, so time spent writing the log is not counted.
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);
  const [switching, startSwitch] = useTransition();

  useEffect(() => {
    if (stoppedAt) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [stoppedAt]);

  const elapsed = runningSeconds(
    { startedAt, pausedAt, pausedSeconds },
    stoppedAt ?? now,
  );

  return (
    <div data-kind={kind} className="flex flex-col gap-8">
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
