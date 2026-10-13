"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/features/sessions/duration";
import {
  deleteCategory,
  updateCategory,
  type CategoryFormState,
} from "./actions";
import { MAX_CATEGORY_NAME_LENGTH } from "./category-input";
import { KindSelect } from "./kind-select";
import type { Category } from "./queries";

const initialState: CategoryFormState = { status: "idle" };

export function CategoryRow({
  category,
  seconds,
}: {
  category: Category;
  seconds: number;
}) {
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
    <li className="flex items-center gap-3 py-1.5">
      <span className="min-w-0 flex-1 truncate font-medium">
        {category.name}
      </span>
      <span
        className={cn(
          "text-sm tabular-nums",
          seconds > 0 ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {formatDuration(seconds)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${category.name}`}
        className="text-muted-foreground"
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
    <form
      action={formAction}
      className="-mx-3 flex flex-col gap-3 rounded-xl bg-muted/60 p-3"
    >
      <input type="hidden" name="id" value={category.id} />
      <div className="flex flex-wrap gap-2">
        <Input
          name="name"
          defaultValue={category.name}
          aria-label="Category name"
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          required
          autoFocus
          className="min-w-32 flex-1"
        />
        <KindSelect defaultValue={category.kind} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="ml-auto text-destructive"
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
