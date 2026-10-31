"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteCategory,
  updateCategory,
  type CategoryFormState,
} from "./actions";
import { MAX_CATEGORY_NAME_LENGTH } from "./category-input";
import { KindMark } from "./kind-mark";
import type { Category } from "./queries";

const initialState: CategoryFormState = { status: "idle" };

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="py-2">
        <CategoryEditForm
          category={category}
          onClose={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2.5 py-1">
      <KindMark kind={category.kind} className="size-2" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {category.name}
      </span>
      <Button
        variant="ghost"
        aria-label={`Edit ${category.name}`}
        className="size-11 text-ink-muted"
        onClick={() => setEditing(true)}
      >
        <Pencil />
      </Button>
    </li>
  );
}

function CategoryEditForm({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [state, formAction, saving] = useActionState(
    async (previous: CategoryFormState, formData: FormData) => {
      const result = await updateCategory(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );
  const error = deleteError ?? (state.status === "error" ? state.message : null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl bg-mist p-3">
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="kind" value={category.kind} />
      <Input
        name="name"
        defaultValue={category.name}
        aria-label="Category name"
        maxLength={MAX_CATEGORY_NAME_LENGTH}
        required
        autoFocus
        className="h-11 rounded-xl"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" className="h-11 rounded-xl px-4" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-xl"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="ml-auto h-11 rounded-xl text-destructive"
          disabled={deleting}
          onClick={() =>
            startDelete(async () => {
              const result = await deleteCategory(category.id);
              setDeleteError(result.status === "error" ? result.message : null);
            })
          }
        >
          {deleting ? "Removing…" : "Remove"}
        </Button>
      </div>
    </form>
  );
}
