"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject, type ProjectFormState } from "./actions";
import { MAX_PROJECT_NAME_LENGTH } from "./project-input";

const initialState: ProjectFormState = { status: "idle" };

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          name="name"
          placeholder="New project"
          aria-label="Project name"
          maxLength={MAX_PROJECT_NAME_LENGTH}
          required
          className="h-10 flex-1"
        />
        <Button type="submit" size="lg" className="h-10" disabled={pending}>
          {pending ? "Adding…" : "Add"}
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
