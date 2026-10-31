"use client";

import { ChevronLeft } from "lucide-react";
import { useActionState, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryKind } from "@/features/categories/category-input";
import type { Category } from "@/features/categories/queries";
import {
  MAX_PROJECT_NAME_LENGTH,
  MAX_PROJECT_WHY_LENGTH,
} from "@/features/projects/project-input";
import { completeSetup, type SetupFormState } from "./actions";
import { StepProgress } from "./step-progress";

const IDEAS = [
  { label: "Portfolio site", tint: "bg-mint" },
  { label: "Side project", tint: "bg-sky" },
  { label: "An album", tint: "bg-lilac" },
  { label: "A course", tint: "bg-butter" },
];

const initialState: SetupFormState = { status: "idle" };

const HEADING = "font-serif text-[30px] leading-9 lg:text-[44px] lg:leading-[50px]";

/** Two steps, saved together at the end so a half-done setup leaves nothing. */
export function SetupFlow({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    completeSetup,
    initialState,
  );
  const [step, setStep] = useState<"project" | "categories">("project");
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [whyOpen, setWhyOpen] = useState(false);
  const [kinds, setKinds] = useState(
    () =>
      new Map<string, CategoryKind>(categories.map((c) => [c.id, c.kind])),
  );
  const projectName = name.trim();

  function toggleKind(id: string) {
    setKinds((current) =>
      new Map(current).set(
        id,
        current.get(id) === "execution" ? "preparation" : "execution",
      ),
    );
  }

  return (
    <form
      action={formAction}
      // Enter in the name field moves on instead of saving the whole setup.
      onSubmit={(event) => {
        if (step === "categories") return;
        event.preventDefault();
        if (projectName) setStep("categories");
      }}
      className="flex flex-1 flex-col gap-3"
    >
      <input type="hidden" name="name" value={projectName} />
      <input type="hidden" name="why" value={why} />
      {categories.map((category) => (
        <input
          key={category.id}
          type="hidden"
          name={kinds.get(category.id)}
          value={category.id}
        />
      ))}

      <StepProgress
        label="Setup progress"
        total={2}
        current={step === "project" ? 0 : 1}
        animate
        className="absolute top-[70px] left-6 w-40 lg:static lg:mb-6 lg:w-[180px]"
      />

      {step === "project" ? (
        <div key="project" className="ft-in flex flex-col gap-3">
          <h1 className={HEADING}>What are you working on?</h1>
          <p className="mb-1 text-[15px] text-ink-soft lg:text-lg">
            Start with one project. You can add more anytime.
          </p>
          <Input
            aria-label="Project name"
            placeholder="Name your project"
            autoComplete="off"
            maxLength={MAX_PROJECT_NAME_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={{ height: 56, fontSize: 17, fontWeight: 600, borderRadius: 16 }}
          />
          <div className="flex flex-wrap gap-2">
            {IDEAS.map((idea, index) => (
              <button
                key={idea.label}
                type="button"
                onClick={() => setName(idea.label)}
                aria-pressed={projectName === idea.label}
                className={cn(
                  "ft-pop inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] bg-paper pr-3 pl-2 text-[13px] font-semibold",
                  projectName === idea.label
                    ? "border-indigo"
                    : "border-line",
                )}
                style={{ animationDelay: `${300 + index * 70}ms` }}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 items-center justify-center rounded-md text-[10px] font-extrabold",
                    idea.tint,
                  )}
                >
                  {idea.label[0]}
                </span>
                {idea.label}
              </button>
            ))}
          </div>
          {whyOpen ? (
            <div className="ft-in mt-1 flex flex-col gap-1.5">
              <Label htmlFor="setup-why">Why it matters</Label>
              <Input
                id="setup-why"
                autoFocus
                autoComplete="off"
                maxLength={MAX_PROJECT_WHY_LENGTH}
                placeholder="e.g. Land a senior frontend role"
                value={why}
                onChange={(event) => setWhy(event.target.value)}
                className="font-serif"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setWhyOpen(true)}
              className="mt-1 flex cursor-pointer flex-col items-start gap-0.5 rounded-2xl border-[1.5px] border-dashed border-line-strong px-4 py-3.5 text-left"
            >
              <span className="text-sm font-bold text-indigo">
                + Why does it matter?{" "}
                <span className="font-medium text-ink-muted">· optional</span>
              </span>
              <span className="text-[13px] text-ink-soft">
                A goal turns hours into progress toward something.
              </span>
            </button>
          )}
        </div>
      ) : (
        <div key="categories" className="ft-in flex flex-col gap-3">
          <h1 className={HEADING}>What counts as making things?</h1>
          <p className="mb-1 text-[15px] leading-[22px] text-ink-soft lg:text-lg">
            We sorted the common ones. Tap any to move it.
          </p>
          <KindGroup
            kind="execution"
            categories={categories.filter(
              (c) => kinds.get(c.id) === "execution",
            )}
            onToggle={toggleKind}
          />
          <KindGroup
            kind="preparation"
            categories={categories.filter(
              (c) => kinds.get(c.id) === "preparation",
            )}
            onToggle={toggleKind}
          />
        </div>
      )}

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="mt-auto flex gap-2.5 pt-6 lg:mt-4">
        {step === "categories" && (
          <button
            type="button"
            aria-label="Back"
            onClick={() => setStep("project")}
            className="flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-paper shadow-[0_1px_2px_rgb(31_27_61/.06),0_6px_16px_rgb(46_42_120/.08)]"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        )}
        <Button
          type="submit"
          disabled={!projectName || pending}
          className="ft-primary min-w-0 flex-1"
        >
          <span className="truncate">
            {step === "categories"
              ? pending
                ? "Saving…"
                : "Looks right"
              : projectName
                ? `Continue with ${projectName}`
                : "Name a project to continue"}
          </span>
        </Button>
      </div>
    </form>
  );
}

const GROUPS = {
  execution: {
    label: "Execution",
    fill: "bg-tangerine-soft",
    text: "text-tangerine-text",
    mark: "rounded-[2px] bg-tangerine",
    moveTo: "preparation",
  },
  preparation: {
    label: "Preparation",
    fill: "bg-periwinkle-soft",
    text: "text-periwinkle-text",
    mark: "rounded-full bg-periwinkle",
    moveTo: "execution",
  },
};

function KindGroup({
  kind,
  categories,
  onToggle,
}: {
  kind: CategoryKind;
  categories: Category[];
  onToggle: (id: string) => void;
}) {
  const group = GROUPS[kind];
  return (
    <div className={cn("flex flex-col gap-2.5 rounded-[20px] p-3.5", group.fill)}>
      <span
        className={cn(
          "flex items-center gap-1.5 text-[13px] font-bold",
          group.text,
        )}
      >
        <span aria-hidden className={cn("size-2", group.mark)} />
        {group.label}
      </span>
      <div className="flex min-h-11 flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onToggle(category.id)}
            aria-label={`${category.name}, ${kind}. Tap to move to ${group.moveTo}`}
            className="ft-pop h-11 cursor-pointer rounded-full bg-paper px-3.5 text-sm font-semibold shadow-[0_2px_6px_rgb(31_27_61/.1)]"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
