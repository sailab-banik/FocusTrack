"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { startSession, type StartFormState } from "./actions";
import { ChoiceChips } from "./choice-chips";
import type { LastUsed } from "./queries";

type Option = { id: string; name: string };

const initialState: StartFormState = { status: "idle" };

export function StartSessionForm({
  projects,
  categories,
  lastUsed,
}: {
  projects: Option[];
  categories: Option[];
  lastUsed: LastUsed | null;
}) {
  const [state, formAction, pending] = useActionState(
    startSession,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ChoiceChips
        name="projectId"
        legend="Project"
        options={projects}
        defaultValue={lastUsed?.projectId}
      />
      <ChoiceChips
        name="categoryId"
        legend="Category"
        options={categories}
        defaultValue={lastUsed?.categoryId}
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="h-14 text-base"
        disabled={pending}
      >
        {pending ? "Starting…" : "Start session"}
      </Button>
    </form>
  );
}
