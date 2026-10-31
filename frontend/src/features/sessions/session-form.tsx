"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SessionFormState } from "./actions";
import { ChoiceChips, type ChoiceOption } from "./choice-chips";
import { MAX_COMMENT_LENGTH } from "./session-log";

export type SessionFormValues = {
  projectId: string | undefined;
  categoryId: string | undefined;
  /** datetime-local values in the user's timezone */
  startedAt: string;
  endedAt: string;
  outcome: string;
};

const initialState: SessionFormState = { status: "idle" };

export function SessionForm({
  action,
  sessionId,
  values,
  maxDateTime,
  projects,
  categories,
  submitLabel,
}: {
  action: (
    state: SessionFormState,
    formData: FormData,
  ) => Promise<SessionFormState>;
  sessionId: string | null;
  values: SessionFormValues;
  maxDateTime: string;
  projects: ChoiceOption[];
  categories: ChoiceOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {sessionId && <input type="hidden" name="id" value={sessionId} />}

      <ChoiceChips
        name="projectId"
        legend="Project"
        options={projects}
        defaultValue={values.projectId}
        required
      />
      <ChoiceChips
        name="categoryId"
        legend="Category"
        options={categories}
        defaultValue={values.categoryId}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startedAt">Start</Label>
          <Input
            id="startedAt"
            name="startedAt"
            type="datetime-local"
            defaultValue={values.startedAt}
            max={maxDateTime}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endedAt">End</Label>
          <Input
            id="endedAt"
            name="endedAt"
            type="datetime-local"
            defaultValue={values.endedAt}
            max={maxDateTime}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="outcome" className="font-serif text-[22px] font-normal">
          What did you get done?
        </Label>
        <Textarea
          id="outcome"
          name="outcome"
          defaultValue={values.outcome}
          maxLength={MAX_COMMENT_LENGTH}
          required
          rows={3}
          className="rounded-2xl p-3.5 font-serif text-lg leading-[26px] md:text-lg"
        />
        <p className="text-[13px] text-ink-muted">
          One line is enough. It’s what your reports read.
        </p>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          size="lg"
          className="h-10 flex-1 sm:flex-none"
          disabled={pending}
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link
          href="/log"
          className={buttonVariants({
            variant: "ghost",
            size: "lg",
            className: "h-10",
          })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
