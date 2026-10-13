"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setGoalArchived, updateGoal, type GoalFormState } from "./actions";
import { GoalFields } from "./goal-fields";
import type { Goal } from "./queries";

const initialState: GoalFormState = { status: "idle" };

export function GoalHeader({ goal }: { goal: Goal }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <GoalEditForm goal={goal} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="text-2xl leading-tight font-semibold tracking-tight text-balance font-stretch-[125%] sm:text-3xl">
          {goal.title}
        </h2>
        {goal.description && (
          <p className="max-w-prose text-muted-foreground">
            {goal.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit goal: ${goal.title}`}
        className="text-muted-foreground"
        onClick={() => setEditing(true)}
      >
        <Pencil />
      </Button>
    </div>
  );
}

function GoalEditForm({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const [archiving, startArchive] = useTransition();
  const [state, formAction, saving] = useActionState(
    async (previous: GoalFormState, formData: FormData) => {
      const result = await updateGoal(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );

  return (
    <form
      action={formAction}
      className="-mx-3 flex flex-col gap-4 rounded-xl bg-muted/60 p-3"
    >
      <input type="hidden" name="id" value={goal.id} />
      <GoalFields
        idPrefix={goal.id}
        title={goal.title}
        description={goal.description ?? ""}
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="ml-auto text-muted-foreground"
          disabled={archiving}
          onClick={() => startArchive(() => setGoalArchived(goal.id, true))}
        >
          {archiving ? "Archiving…" : "Archive"}
        </Button>
      </div>
    </form>
  );
}
