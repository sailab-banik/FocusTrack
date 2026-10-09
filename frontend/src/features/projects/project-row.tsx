"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Goal } from "@/features/goals/queries";
import {
  setProjectArchived,
  updateProject,
  type ProjectFormState,
} from "./actions";
import { MAX_PROJECT_NAME_LENGTH } from "./project-input";
import type { Project } from "./queries";

const initialState: ProjectFormState = { status: "idle" };

export function ProjectRow({
  project,
  goals,
}: {
  project: Project;
  goals: Goal[];
}) {
  const [editing, setEditing] = useState(false);
  const [archiving, startArchive] = useTransition();
  const [state, formAction, saving] = useActionState(
    async (previous: ProjectFormState, formData: FormData) => {
      const result = await updateProject(previous, formData);
      if (result.status === "saved") setEditing(false);
      return result;
    },
    initialState,
  );
  const goal = goals.find((g) => g.id === project.goalId);

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-2 py-2">
        <div className="flex min-w-0 flex-col">
          <span
            className={
              project.archived ? "truncate text-muted-foreground" : "truncate"
            }
          >
            {project.name}
          </span>
          {goal && (
            <span className="truncate text-xs text-muted-foreground">
              → {goal.title}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {!project.archived && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={archiving}
            onClick={() =>
              startArchive(() =>
                setProjectArchived(project.id, !project.archived),
              )
            }
          >
            {project.archived ? "Restore" : "Archive"}
          </Button>
        </div>
      </li>
    );
  }

  // Archived goals stay selectable only for a project already linked to one.
  const goalOptions = goals.filter(
    (g) => !g.archived || g.id === project.goalId,
  );

  return (
    <li className="py-2">
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={project.id} />
        <div className="flex flex-wrap gap-2">
          <Input
            name="name"
            defaultValue={project.name}
            aria-label="Project name"
            maxLength={MAX_PROJECT_NAME_LENGTH}
            required
            autoFocus
            className="h-10 min-w-40 flex-1"
          />
          <select
            name="goalId"
            defaultValue={project.goalId ?? ""}
            aria-label="Goal"
            className="h-10 max-w-full min-w-40 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          >
            <option value="">No goal</option>
            {goalOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
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
        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </form>
    </li>
  );
}
