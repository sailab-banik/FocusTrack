"use client";

import { Play } from "lucide-react";
import { use, useActionState, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import type { Category } from "@/features/categories/queries";
import { KindMark } from "@/features/categories/kind-mark";
import { ProjectTile } from "@/features/projects/project-tile";
import { startSession, type SessionFormState } from "./actions";
import { parseStartInput } from "./start-input";
import { ShowStartedContext } from "./timer-screen";

const initialState: SessionFormState = { status: "idle" };

export function StartSessionForm({
  projects,
  categories,
  defaultProjectId,
  defaultCategoryId,
}: {
  projects: { id: string; name: string }[];
  categories: Category[];
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
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [choosing, setChoosing] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const category = categories.find((c) => c.id === categoryId);
  // Phones offer the last pair as one big button, so a start is a single tap.
  const quickStart = project && category && !choosing;

  return (
    <form action={formAction} className="flex flex-col gap-4 md:gap-5">
      <h2 className="font-serif text-[22px] md:text-[26px]">
        <span className="md:hidden">
          {quickStart ? "Ready for the next one?" : "What’s next?"}
        </span>
        <span className="hidden md:inline">What are you working on next?</span>
      </h2>

      {quickStart && (
        <div className="flex flex-col gap-3 md:hidden">
          <button
            type="submit"
            disabled={pending}
            className="flex h-[76px] cursor-pointer items-center gap-3.5 rounded-[18px] bg-indigo px-4 text-left text-white shadow-[0_8px_20px_rgb(46_42_120/.25)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-peach">
              <Play aria-hidden className="size-3.5 fill-indigo text-indigo" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[17px] font-semibold">
                {project.name}
              </span>
              <span className="text-[13px] text-[#cfcbf5]">
                {category.name} · tap to start
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setChoosing(true)}
            className="h-12 cursor-pointer rounded-[14px] bg-wash text-[15px] font-semibold text-indigo"
          >
            Something else
          </button>
        </div>
      )}

      <div
        className={cn(
          "flex-col gap-4 md:flex md:gap-5",
          quickStart ? "hidden" : "flex",
        )}
      >
        <fieldset>
          <legend className="sr-only">Project</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-2.5">
            {projects.map((option) => (
              <label
                key={option.id}
                className="flex h-14 cursor-pointer items-center gap-2.5 rounded-2xl border-[1.5px] border-line bg-paper px-3 text-sm font-semibold transition-colors select-none has-checked:border-indigo has-checked:bg-mist has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-periwinkle md:h-16"
              >
                <input
                  type="radio"
                  name="projectId"
                  value={option.id}
                  checked={option.id === projectId}
                  onChange={() => setProjectId(option.id)}
                  required
                  className="sr-only"
                />
                <ProjectTile id={option.id} name={option.name} size="sm" />
                <span className="min-w-0 truncate">{option.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="sr-only">Category</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((option) => (
              <label
                key={option.id}
                data-kind={option.kind}
                className="inline-flex h-11 cursor-pointer items-center gap-[7px] rounded-full border-[1.5px] border-line bg-paper px-3.5 text-sm font-semibold text-ink-soft transition-colors select-none has-checked:border-kind has-checked:bg-kind-soft has-checked:text-kind-text has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-periwinkle md:h-[38px]"
              >
                <input
                  type="radio"
                  name="categoryId"
                  value={option.id}
                  checked={option.id === categoryId}
                  onChange={() => setCategoryId(option.id)}
                  required
                  className="sr-only"
                />
                <KindMark kind={option.kind} className="size-2" />
                {option.name}
                <span className="sr-only">({option.kind})</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className={cn("md:flex", quickStart ? "hidden" : "flex")}>
        <Button
          type="submit"
          disabled={pending}
          className="h-14 w-full min-w-0 gap-2.5 rounded-2xl text-[15px] font-semibold shadow-[0_8px_20px_rgb(46_42_120/.25)] md:h-[52px] md:w-auto md:max-w-full md:rounded-[14px] md:px-6"
        >
          <Play className="size-3 fill-current" />
          <span className="truncate">
            {pending
              ? "Starting…"
              : project && category
                ? `Start ${project.name} · ${category.name}`
                : "Start session"}
          </span>
        </Button>
      </div>
    </form>
  );
}
