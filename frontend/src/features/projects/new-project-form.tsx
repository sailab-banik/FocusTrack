"use client";

import { useActionState } from "react";
import { AddToggle } from "@/components/add-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Goal } from "@/features/goals/queries";
import { createProject, linkProject, type ProjectFormState } from "./actions";
import { MAX_PROJECT_NAME_LENGTH } from "./project-input";
import type { Project } from "./queries";

const initialState: ProjectFormState = { status: "idle" };

/**
 * Adds a project, linked to `goalId` when given. Under a goal, one of the
 * `linkable` projects can be linked instead of naming a new one.
 */
export function NewProjectForm({
  goalId,
  goals,
  linkable,
}: {
  goalId: string | null;
  goals: Goal[];
  linkable: Project[];
}) {
  return (
    <AddToggle label="Add project">
      {(close) => (
        <div className="flex flex-col">
          {goalId && linkable.length > 0 && (
            <ExistingProjectForm
              goalId={goalId}
              goals={goals}
              projects={linkable}
              onClose={close}
            />
          )}
          <ProjectNameForm goalId={goalId} onClose={close} />
        </div>
      )}
    </AddToggle>
  );
}

function ExistingProjectForm({
  goalId,
  goals,
  projects,
  onClose,
}: {
  goalId: string;
  goals: Goal[];
  projects: Project[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (previous: ProjectFormState, formData: FormData) => {
      const result = await linkProject(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );
  // Only an active goal is worth naming: the page lists projects of archived
  // goals as serving none.
  const goalTitle = new Map(
    goals.filter((g) => !g.archived).map((g) => [g.id, g.title]),
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 py-2">
      <input type="hidden" name="goalId" value={goalId} />
      <div className="flex flex-wrap gap-2">
        <select
          name="id"
          defaultValue=""
          required
          aria-label="Existing project"
          className="h-10 max-w-full min-w-48 flex-1 rounded-lg border border-input bg-card pr-9 pl-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          <option value="" disabled>
            Choose an existing project
          </option>
          {projects.map((project) => {
            const from = project.goalId && goalTitle.get(project.goalId);
            return (
              <option key={project.id} value={project.id}>
                {from ? `${project.name} (moves from ${from})` : project.name}
              </option>
            );
          })}
        </select>
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="h-10 px-4"
          disabled={pending}
        >
          {pending ? "Adding…" : "Add existing"}
        </Button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}

function ProjectNameForm({
  goalId,
  onClose,
}: {
  goalId: string | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (previous: ProjectFormState, formData: FormData) => {
      const result = await createProject(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 py-2">
      {goalId && <input type="hidden" name="goalId" value={goalId} />}
      <div className="flex flex-wrap gap-2">
        <Input
          name="name"
          placeholder="New project name"
          aria-label="Project name"
          maxLength={MAX_PROJECT_NAME_LENGTH}
          required
          autoFocus
          className="min-w-48 flex-1"
        />
        <div className="flex gap-1">
          <Button
            type="submit"
            size="lg"
            className="h-10 px-4"
            disabled={pending}
          >
            {pending ? "Adding…" : "Add"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-10"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
