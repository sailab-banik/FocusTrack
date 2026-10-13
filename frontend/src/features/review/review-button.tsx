"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { requestWeeklyReview, type ReviewState } from "./actions";

const initialState: ReviewState = { status: "idle" };

export function ReviewButton({
  label,
  variant,
}: {
  label: string;
  variant: "default" | "outline";
}) {
  const [state, formAction, pending] = useActionState(
    requestWeeklyReview,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <Button
        type="submit"
        variant={variant}
        size="lg"
        className="h-10 px-4"
        disabled={pending}
      >
        {pending ? "Writing the review…" : label}
      </Button>
      {pending && (
        <p role="status" className="text-sm text-muted-foreground">
          This can take up to a minute.
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
