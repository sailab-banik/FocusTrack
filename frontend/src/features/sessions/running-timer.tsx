"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { stopSession } from "./actions";
import { durationSeconds, formatClock } from "./duration";

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
  const [stopping, startStop] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = Math.max(0, durationSeconds(new Date(startedAt), now));

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {projectName} · {categoryName}
        </p>
        {/* Server and client clocks differ by the render delay. */}
        <p
          className="font-mono text-6xl font-semibold tabular-nums"
          suppressHydrationWarning
        >
          {formatClock(elapsed)}
        </p>
      </div>
      <Button
        size="lg"
        variant="destructive"
        className="h-14 w-full text-base"
        disabled={stopping}
        onClick={() => startStop(() => stopSession(sessionId))}
      >
        {stopping ? "Stopping…" : "Stop session"}
      </Button>
    </div>
  );
}
