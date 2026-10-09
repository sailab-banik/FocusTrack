"use client";

import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";
import { durationSeconds, formatClock } from "./duration";
import { StopSessionForm } from "./stop-session-form";
import { TimerFace } from "./timer-face";

export function RunningTimer({
  sessionId,
  startedAt,
  projectName,
  categoryName,
  kind,
}: {
  sessionId: string;
  startedAt: string;
  projectName: string;
  categoryName: string;
  kind: CategoryKind;
}) {
  const [now, setNow] = useState(() => new Date());
  // Set when Stop is tapped, so time spent writing the log is not counted.
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (stoppedAt) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [stoppedAt]);

  const elapsed = Math.max(
    0,
    durationSeconds(new Date(startedAt), stoppedAt ?? now),
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
        {stoppedAt && (
          <p className="text-5xl leading-none font-bold text-muted-foreground tabular-nums font-stretch-[68%]">
            {formatClock(elapsed)}
          </p>
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
          <TimerFace elapsedSeconds={elapsed} />
          <Button
            size="lg"
            className="h-14 rounded-xl text-base"
            onClick={() => setStoppedAt(new Date())}
          >
            <Square className="fill-current" />
            Stop session
          </Button>
        </>
      )}
    </div>
  );
}
