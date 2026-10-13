"use client";

import { useActionState } from "react";
import { AddToggle } from "@/components/add-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject, type ProjectFormState } from "./actions";
import { MAX_PROJECT_NAME_LENGTH } from "./project-input";

const initialState: ProjectFormState = { status: "idle" };

/** Adds a project, linked to `goalId` when given. */
export function NewProjectForm({ goalId }: { goalId: string | null }) {
  return (
    <AddToggle label="Add project">
      {(close) => <ProjectNameForm goalId={goalId} onClose={close} />}
    </AddToggle>
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
          placeholder="Project name"
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
