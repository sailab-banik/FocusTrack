"use client";

import { useActionState } from "react";
import { AddToggle } from "@/components/add-toggle";
import { Button } from "@/components/ui/button";
import { createGoal, type GoalFormState } from "./actions";
import { GoalFields } from "./goal-fields";

const initialState: GoalFormState = { status: "idle" };

export function NewGoalForm() {
  return (
    <AddToggle label="Add a goal">
      {(close) => <GoalForm onClose={close} />}
    </AddToggle>
  );
}

function GoalForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (previous: GoalFormState, formData: FormData) => {
      const result = await createGoal(previous, formData);
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
      <GoalFields idPrefix="new-goal" title="" description="" />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Adding…" : "Add goal"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
