"use client";

import { use, useActionState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startSession, type SessionFormState } from "./actions";
import { ChoiceChips, type ChoiceOption } from "./choice-chips";
import { parseStartInput } from "./start-input";
import { ShowStartedContext } from "./timer-screen";

const initialState: SessionFormState = { status: "idle" };

export function StartSessionForm({
  projects,
  categories,
  defaultProjectId,
  defaultCategoryId,
}: {
  projects: ChoiceOption[];
  categories: ChoiceOption[];
  defaultProjectId: string | undefined;
  defaultCategoryId: string | undefined;
}) {
  // Always rendered inside TimerScreen.
  const showStarted = use(ShowStartedContext)!;
  const [state, formAction, pending] = useActionState(
    (previous: SessionFormState, formData: FormData) => {
      const sessionId = crypto.randomUUID();
      formData.set("sessionId", sessionId);
      const parsed = parseStartInput(formData);
      if (parsed.ok) showStarted(sessionId, parsed.input);
      return startSession(previous, formData);
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ChoiceChips
        name="projectId"
        legend="Project"
        options={projects}
        defaultValue={defaultProjectId}
        required
      />
      <ChoiceChips
        name="categoryId"
        legend="Category"
        options={categories}
        defaultValue={defaultCategoryId}
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
