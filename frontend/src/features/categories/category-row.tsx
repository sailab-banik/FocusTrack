"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteCategory,
  updateCategory,
  type CategoryFormState,
} from "./actions";
import { MAX_CATEGORY_NAME_LENGTH } from "./category-input";
import { KindSelect } from "./kind-select";
import type { Category } from "./queries";

const initialState: CategoryFormState = { status: "idle" };

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [state, formAction, saving] = useActionState(
    async (previous: CategoryFormState, formData: FormData) => {
      const result = await updateCategory(previous, formData);
      if (result.status === "saved") setEditing(false);
      return result;
    },
    initialState,
  );

  if (!editing) {
    return (
      <li className="flex flex-col gap-1 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{category.name}</span>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              disabled={deleting}
              onClick={() =>
                startDelete(async () => {
                  const result = await deleteCategory(category.id);
                  setDeleteError(
                    result.status === "error" ? result.message : null,
                  );
                })
              }
            >
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </div>
        </div>
        {deleteError && (
          <p role="alert" className="text-sm text-destructive">
            {deleteError}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="py-3">
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={category.id} />
        <div className="flex flex-wrap gap-2">
          <Input
            name="name"
            defaultValue={category.name}
            aria-label="Category name"
            maxLength={MAX_CATEGORY_NAME_LENGTH}
            required
            autoFocus
            className="min-w-40 flex-1"
          />
          <KindSelect defaultValue={category.kind} />
          <div className="flex gap-1">
            <Button type="submit" size="lg" className="h-10" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-10"
              onClick={() => setEditing(false)}
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
    </li>
  );
}
