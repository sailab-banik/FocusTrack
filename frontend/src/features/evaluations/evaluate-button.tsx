"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { evaluateSessionNow } from "./actions";

export function EvaluateButton({
  sessionId,
  label,
}: {
  sessionId: string;
  label: string;
}) {
  const [pending, startEvaluate] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startEvaluate(async () => {
            const result = await evaluateSessionNow(sessionId);
            setError(result.status === "error" ? result.message : null);
          })
        }
      >
        {pending ? "Evaluating…" : label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
