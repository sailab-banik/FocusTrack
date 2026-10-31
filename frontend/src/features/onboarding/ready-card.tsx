"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { HOME_PATH } from "@/features/auth/routes";
import type { Category } from "@/features/categories/queries";
import type { Project } from "@/features/projects/queries";
import type { SessionFormState } from "@/features/sessions/actions";
import { startFirstSession } from "./actions";

const initialState: SessionFormState = { status: "idle" };

export function ReadyCard({
  project,
  category,
}: {
  project: Project;
  category: Category;
}) {
  const [state, formAction, pending] = useActionState(
    (previous: SessionFormState, formData: FormData) => {
      formData.set("sessionId", crypto.randomUUID());
      return startFirstSession(previous, formData);
    },
    initialState,
  );
  const isExecution = category.kind === "execution";

  return (
    <form
      action={formAction}
      className="ft-pop flex flex-col gap-4 rounded-[26px] bg-paper p-5 shadow-[0_1px_2px_rgb(31_27_61/.06),0_20px_44px_rgb(46_42_120/.14)]"
      style={{ animationDelay: "300ms" }}
    >
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="categoryId" value={category.id} />
      <div className="flex items-center justify-between gap-2.5">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-peach font-bold">
            {project.name[0].toUpperCase()}
          </span>
          <span className="truncate text-base font-semibold">
            {project.name}
          </span>
        </span>
        <span
          className={cn(
            "inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full px-[11px] text-[13px] font-semibold",
            isExecution
              ? "bg-tangerine-soft text-tangerine-text"
              : "bg-periwinkle-soft text-periwinkle-text",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-2",
              isExecution
                ? "rounded-[2px] bg-tangerine"
                : "rounded-full bg-periwinkle",
            )}
          />
          {category.name}
        </span>
      </div>
      <span className="font-serif text-[72px] leading-[76px] tracking-[-0.03em]">
        00:00
      </span>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="ft-primary ft-breathe gap-2.5"
      >
        <Play className="size-3.5 fill-current" />
        {pending ? "Starting…" : "Start your first session"}
      </Button>
      <Link
        href={HOME_PATH}
        className="-mt-1 flex h-11 items-center justify-center text-sm font-semibold text-ink-soft"
      >
        Skip for now
      </Link>
    </form>
  );
}
