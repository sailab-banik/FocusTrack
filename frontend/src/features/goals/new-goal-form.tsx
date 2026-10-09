"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createGoal, type GoalFormState } from "./actions";
import { GoalFields } from "./goal-fields";

const initialState: GoalFormState = { status: "idle" };

export function NewGoalForm() {
  const [state, formAction, pending] = useActionState(createGoal, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <GoalFields idPrefix="new-goal" title="" description="" />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="h-10 self-start px-4"
        disabled={pending}
      >
        {pending ? "Adding…" : "Add goal"}
      </Button>
    </form>
  );
}
