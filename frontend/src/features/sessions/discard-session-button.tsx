"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { discardSession } from "./actions";
import { formatDuration } from "./duration";

/** Asks once, then deletes the running session without logging it. */
export function DiscardSessionButton({
  sessionId,
  elapsedSeconds,
}: {
  sessionId: string;
  elapsedSeconds: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [discarding, startDiscard] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="h-10 self-center text-muted-foreground"
        onClick={() => setConfirming(true)}
      >
        <Trash2 />
        Discard session
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Discard this session"
      className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/60 p-3"
    >
      <p className="mr-auto text-sm">
        Discard this session?{" "}
        {elapsedSeconds >= 60
          ? `Its ${formatDuration(elapsedSeconds)} will not be saved.`
          : "It will not be saved."}
      </p>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="destructive"
          size="lg"
          disabled={discarding}
          onClick={() => startDiscard(() => discardSession(sessionId))}
        >
          {discarding ? "Discarding…" : "Discard"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={discarding}
          onClick={() => setConfirming(false)}
        >
          Keep it
        </Button>
      </div>
    </div>
  );
}
