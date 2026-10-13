"use client";

import { useActionState } from "react";
import { AddToggle } from "@/components/add-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, type CategoryFormState } from "./actions";
import { MAX_CATEGORY_NAME_LENGTH, type CategoryKind } from "./category-input";

const initialState: CategoryFormState = { status: "idle" };

/** Adds a category of the given kind; each kind's column has its own. */
export function NewCategoryForm({ kind }: { kind: CategoryKind }) {
  return (
    <AddToggle label="Add category">
      {(close) => <CategoryNameForm kind={kind} onClose={close} />}
    </AddToggle>
  );
}

function CategoryNameForm({
  kind,
  onClose,
}: {
  kind: CategoryKind;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (previous: CategoryFormState, formData: FormData) => {
      const result = await createCategory(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 py-2">
      <input type="hidden" name="kind" value={kind} />
      <Input
        name="name"
        placeholder="Category name"
        aria-label="Category name"
        maxLength={MAX_CATEGORY_NAME_LENGTH}
        required
        autoFocus
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Adding…" : "Add"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
