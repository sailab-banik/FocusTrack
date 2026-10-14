"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Goal } from "@/features/goals/queries";
import { formatDuration } from "@/features/sessions/duration";
import { totalSeconds, type KindSeconds } from "@/features/work/allocation";
import { TimeBar } from "@/features/work/time-bar";
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
  time,
  maxSeconds,
}: {
  project: Project;
  goals: Goal[];
  time: KindSeconds;
  maxSeconds: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="py-2">
        <ProjectEditForm
          project={project}
          goals={goals}
          onClose={() => setEditing(false)}
        />
      </li>
    );
  }

  const total = totalSeconds(time);
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1.5 py-2.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_4.5rem_auto]">
      <span className="truncate font-medium">{project.name}</span>
      <TimeBar
        time={time}
        maxSeconds={maxSeconds}
        className="order-last col-span-full sm:order-none sm:col-span-1"
      />
      <span
        className={cn(
          "text-right text-sm tabular-nums",
          total > 0 ? "font-medium" : "text-muted-foreground",
        )}
      >
        {formatDuration(total)}
        {total > 0 && (
          <span className="sr-only">
            : {formatDuration(time.execution)} execution,{" "}
            {formatDuration(time.preparation)} preparation
          </span>
        )}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${project.name}`}
        className="text-muted-foreground"
        onClick={() => setEditing(true)}
      >
        <Pencil />
      </Button>
    </li>
  );
}

function ProjectEditForm({
  project,
  goals,
  onClose,
}: {
  project: Project;
  goals: Goal[];
  onClose: () => void;
}) {
  const [archiving, startArchive] = useTransition();
  const [state, formAction, saving] = useActionState(
    async (previous: ProjectFormState, formData: FormData) => {
      const result = await updateProject(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );
  // Archived goals stay selectable only for a project already linked to one.
  const goalOptions = goals.filter(
    (g) => !g.archived || g.id === project.goalId,
  );

  return (
    <form
      action={formAction}
      className="-mx-3 flex flex-col gap-3 rounded-xl bg-muted/60 p-3"
    >
      <input type="hidden" name="id" value={project.id} />
      <div className="flex flex-wrap gap-2">
        <Input
          name="name"
          defaultValue={project.name}
          aria-label="Project name"
          maxLength={MAX_PROJECT_NAME_LENGTH}
          required
          autoFocus
          className="min-w-40 flex-1"
        />
        <select
          name="goalId"
          defaultValue={project.goalId ?? ""}
          aria-label="Goal it serves"
          className="h-10 max-w-full min-w-40 flex-1 rounded-lg border border-input bg-card pr-9 pl-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          <option value="">Not serving a goal</option>
          {goalOptions.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>
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
          onClick={() =>
            startArchive(() => setProjectArchived(project.id, true))
          }
        >
          {archiving ? "Archiving…" : "Archive"}
        </Button>
      </div>
    </form>
  );
}
