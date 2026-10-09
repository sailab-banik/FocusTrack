"use client";

import { useActionState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startSession, type SessionFormState } from "./actions";
import { ChoiceChips, type ChoiceOption } from "./choice-chips";
import type { LastUsed } from "./queries";

const initialState: SessionFormState = { status: "idle" };

export function StartSessionForm({
  projects,
  categories,
  lastUsed,
}: {
  projects: ChoiceOption[];
  categories: ChoiceOption[];
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
        required
      />
      <ChoiceChips
        name="categoryId"
        legend="Category"
        options={categories}
        defaultValue={lastUsed?.categoryId}
        required
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        variant="kind"
        className="h-14 rounded-xl text-base"
        disabled={pending}
      >
        <Play className="fill-current" />
        {pending ? "Starting…" : "Start session"}
      </Button>
    </form>
  );
}
