"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  setGoalArchived,
  updateGoal,
  type GoalFormState,
} from "./actions";
import { GoalFields } from "./goal-fields";
import type { Goal } from "./queries";

const initialState: GoalFormState = { status: "idle" };

export function GoalCard({
  goal,
  projectNames,
}: {
  goal: Goal;
  projectNames: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [archiving, startArchive] = useTransition();
  const [state, formAction, saving] = useActionState(
    async (previous: GoalFormState, formData: FormData) => {
      const result = await updateGoal(previous, formData);
      if (result.status === "saved") setEditing(false);
      return result;
    },
    initialState,
  );

  if (editing) {
    return (
      <li className="rounded-2xl border bg-card p-5">
        <form action={formAction} className="flex flex-col gap-4">
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
            <Button type="submit" size="lg" className="h-10" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-10"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h3
            className={cn(
              "text-lg font-semibold tracking-tight",
              goal.archived && "text-muted-foreground",
            )}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {!goal.archived && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={archiving}
            onClick={() =>
              startArchive(() => setGoalArchived(goal.id, !goal.archived))
            }
          >
            {goal.archived ? "Restore" : "Archive"}
          </Button>
        </div>
      </div>
      {projectNames.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {projectNames.map((name) => (
            <li
              key={name}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium"
            >
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No projects serve this goal yet.{" "}
          <Link
            href="/projects"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Link one from Projects.
          </Link>
        </p>
      )}
    </li>
  );
}
