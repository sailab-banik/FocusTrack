"use client";

import { useActionState, useEffect, useOptimistic, useState, useTransition } from "react";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import {
  createCategory,
  moveCategory,
  type CategoryFormState,
} from "./actions";
import { MAX_CATEGORY_NAME_LENGTH, type CategoryKind } from "./category-input";
import { CategoryRow } from "./category-row";
import { KindMark } from "./kind-mark";
import type { Category } from "./queries";

const GROUPS = [
  {
    kind: "execution",
    label: "Execution · making things",
    data: "execution",
  },
  {
    kind: "preparation",
    label: "Preparation · getting ready",
    data: "preparation",
  },
] as const;

const TOAST_MS = 3300;
const initialState: CategoryFormState = { status: "idle" };

function otherKind(kind: CategoryKind): CategoryKind {
  return kind === "execution" ? "preparation" : "execution";
}

/** Tap a category to move it between the two kinds. */
export function CategoryBoard({
  categories,
  sessionCounts,
}: {
  categories: Category[];
  sessionCounts: Map<string, number>;
}) {
  const [shown, setKind] = useOptimistic(
    categories,
    (current, move: { id: string; kind: CategoryKind }) =>
      current.map((c) => (c.id === move.id ? { ...c, kind: move.kind } : c)),
  );
  const [, startMove] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [state, formAction, pending] = useActionState(
    async (previous: CategoryFormState, formData: FormData) => {
      const result = await createCategory(previous, formData);
      if (result.status === "saved") {
        setToast(`${formData.get("name")} added`);
        setDraft("");
      }
      return result;
    },
    initialState,
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  function move(category: Category) {
    const kind = otherKind(category.kind);
    startMove(async () => {
      setKind({ id: category.id, kind });
      await moveCategory(category.id, kind);
      setToast(`${category.name} now counts as ${kind}`);
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-3.5">
        {GROUPS.map((group) => (
          <div
            key={group.kind}
            data-kind={group.data}
            className="flex min-w-0 flex-[1_1_260px] flex-col gap-3 rounded-[20px] bg-kind-soft p-4"
          >
            <span className="flex items-center gap-[7px] text-[13px] font-bold text-kind-text">
              <KindMark kind={group.kind} className="size-[9px]" />
              {group.label}
            </span>
            <div className="flex min-h-11 flex-wrap gap-2">
              {shown
                .filter((c) => c.kind === group.kind)
                .map((category) => {
                  const count = sessionCounts.get(category.id) ?? 0;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => move(category)}
                      aria-label={`${category.name}, ${category.kind}. Move to ${otherKind(category.kind)}`}
                      className="ft-pop inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-paper px-3.5 text-sm font-semibold text-ink shadow-[0_2px_6px_rgb(31_27_61/.1)]"
                    >
                      {category.name}
                      <span className="text-xs font-medium text-ink-muted">
                        {count === 1 ? "1 session" : `${count} sessions`}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <label htmlFor="new-category" className="sr-only">
          New category name
        </label>
        <Input
          id="new-category"
          name="name"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          required
          placeholder="Add a category, e.g. Write"
          className="h-11 min-w-0 flex-[1_1_220px] rounded-[14px] border-[1.5px] border-line px-3.5 md:text-sm"
        />
        {GROUPS.map((group) => (
          <button
            key={group.kind}
            type="submit"
            name="kind"
            value={group.kind}
            data-kind={group.data}
            disabled={pending}
            className="inline-flex h-11 cursor-pointer items-center gap-[7px] rounded-[14px] bg-kind-soft px-3.5 text-[13px] font-bold text-kind-text disabled:opacity-60"
          >
            <KindMark kind={group.kind} className="size-2" />
            Add as {group.kind}
          </button>
        ))}
      </form>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <p className="text-[13px] text-ink-muted">
        Moving a category recalculates past weeks too. The split is worked out
        from your sessions, not stored.
      </p>

      <details>
        <summary className="w-fit cursor-pointer text-[13px] font-semibold text-indigo">
          Rename or remove a category
        </summary>
        <ul className="mt-2 flex flex-col divide-y divide-line-soft">
          {shown.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </ul>
      </details>

      <div
        role="status"
        className={cn(
          "fixed top-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-[0_12px_32px_rgb(31_27_61/.25)] md:top-auto md:right-6 md:bottom-6 md:left-auto md:translate-x-0",
          !toast && "sr-only",
        )}
      >
        {toast}
      </div>
    </>
  );
}
