"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteSession } from "./actions";

// Two taps instead of a browser confirm dialog.
export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        className="text-destructive"
        onClick={() => setConfirming(true)}
      >
        Delete session
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Delete this session permanently?
      </span>
      <Button
        variant="destructive"
        disabled={deleting}
        onClick={() => startDelete(() => deleteSession(sessionId))}
      >
        {deleting ? "Deleting…" : "Delete"}
      </Button>
      <Button
        variant="ghost"
        disabled={deleting}
        onClick={() => setConfirming(false)}
      >
        Keep
      </Button>
    </div>
  );
}
