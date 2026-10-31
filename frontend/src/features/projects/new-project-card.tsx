"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject, type ProjectFormState } from "./actions";
import { MAX_PROJECT_NAME_LENGTH } from "./project-input";

const initialState: ProjectFormState = { status: "idle" };

export function NewProjectCard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (previous: ProjectFormState, formData: FormData) => {
      const result = await createProject(previous, formData);
      if (result.status === "saved") onOpenChange(false);
      return result;
    },
    initialState,
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="ft-in flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-3.5 rounded-3xl border-2 border-dashed border-line-strong p-[22px]"
      >
        <Desk />
        <span className="text-[15px] font-semibold text-indigo">
          + New project
        </span>
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="ft-in flex min-h-[300px] flex-col justify-center gap-3 rounded-3xl border-2 border-dashed border-line-strong p-[22px]"
    >
      <label htmlFor="new-project" className="font-serif text-[22px]">
        What are you working on?
      </label>
      <Input
        id="new-project"
        name="name"
        placeholder="Name your project"
        maxLength={MAX_PROJECT_NAME_LENGTH}
        required
        autoFocus
        className="h-12 rounded-[14px] px-3.5"
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" className="h-11 rounded-xl px-4" disabled={pending}>
          {pending ? "Adding…" : "Add project"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-xl"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Desk() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 160 96"
      className="h-24 w-40 rounded-[18px] bg-butter"
    >
      <rect x="30" y="72" width="100" height="7" rx="3.5" fill="#E8C66A" />
      <rect x="44" y="38" width="46" height="34" rx="6" fill="#FFFFFF" />
      <rect x="50" y="46" width="26" height="4" rx="2" fill="#E4DEFF" />
      <rect x="50" y="55" width="34" height="4" rx="2" fill="#E4DEFF" />
      <rect x="100" y="52" width="18" height="20" rx="4" fill="#FFFFFF" />
    </svg>
  );
}
