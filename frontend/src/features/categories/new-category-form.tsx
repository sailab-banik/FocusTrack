"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, type CategoryFormState } from "./actions";
import { MAX_CATEGORY_NAME_LENGTH } from "./category-input";
import { KindSelect } from "./kind-select";

const initialState: CategoryFormState = { status: "idle" };

export function NewCategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategory,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Input
          name="name"
          placeholder="New category"
          aria-label="Category name"
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          required
          className="h-10 min-w-40 flex-1"
        />
        <KindSelect defaultValue="execution" />
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
