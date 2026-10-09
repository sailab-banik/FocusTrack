"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { durationSeconds, formatClock } from "./duration";
import { StopSessionForm } from "./stop-session-form";

export function RunningTimer({
  sessionId,
  startedAt,
  projectName,
  categoryName,
}: {
  sessionId: string;
  startedAt: string;
  projectName: string;
  categoryName: string;
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
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {projectName} · {categoryName}
        </p>
        {/* Server and client clocks differ by the render delay. */}
        <p
          className={
            stoppedAt
              ? "font-mono text-4xl font-semibold text-muted-foreground tabular-nums"
              : "font-mono text-6xl font-semibold tabular-nums"
          }
          suppressHydrationWarning
        >
          {formatClock(elapsed)}
        </p>
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
        <Button
          size="lg"
          variant="destructive"
          className="h-14 w-full text-base"
          onClick={() => setStoppedAt(new Date())}
        >
          Stop session
        </Button>
      )}
    </div>
  );
}
