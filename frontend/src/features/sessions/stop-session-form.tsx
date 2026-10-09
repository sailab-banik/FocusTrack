"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { stopSession, type SessionFormState } from "./actions";
import { RatingChips } from "./rating-chips";
import { LOG_LIMITS } from "./session-log";

const initialState: SessionFormState = { status: "idle" };

export function StopSessionForm({
  sessionId,
  stoppedAt,
  onResume,
}: {
  sessionId: string;
  stoppedAt: Date;
  onResume: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    stopSession,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-5 text-left">
      <input type="hidden" name="id" value={sessionId} />
      <input type="hidden" name="stoppedAt" value={stoppedAt.toISOString()} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">What did you work on?</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={LOG_LIMITS.description}
          required
          autoFocus
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="outcome">Outcome: what was produced?</Label>
        <Textarea
          id="outcome"
          name="outcome"
          maxLength={LOG_LIMITS.outcome}
          placeholder="e.g. Merged the stop form, or: nothing shipped, still unclear on the data model"
          required
          rows={2}
        />
      </div>

      <RatingChips
        name="energy"
        label="Energy"
        low="drained"
        high="sharp"
        defaultValue={null}
        clearable={false}
      />
      <RatingChips
        name="difficulty"
        label="Difficulty"
        low="easy"
        high="hard"
        defaultValue={null}
        clearable={false}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">
          Notes{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          name="notes"
          maxLength={LOG_LIMITS.notes}
          rows={2}
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          size="lg"
          className="h-14 text-base"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save session"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-10"
          disabled={pending}
          onClick={onResume}
        >
          Keep going
        </Button>
      </div>
    </form>
  );
}
