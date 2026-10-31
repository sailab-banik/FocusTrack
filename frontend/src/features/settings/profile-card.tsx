"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateName, type NameFormState } from "./actions";
import { MAX_NAME_LENGTH } from "./name";

const initialState: NameFormState = { status: "idle" };

export function ProfileForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [draft, setDraft] = useState(name);
  const [state, formAction, pending] = useActionState(updateName, initialState);
  const dirty = draft.trim() !== name;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <span
        aria-hidden
        className="flex size-[72px] shrink-0 items-center justify-center rounded-[22px] bg-peach font-serif text-[32px]"
      >
        {(draft.trim() || email)[0]?.toUpperCase()}
      </span>
      <form
        action={formAction}
        className="flex min-w-[240px] flex-[1_1_260px] flex-col gap-1.5"
      >
        <label htmlFor="settings-name" className="text-[13px] font-semibold">
          Name
        </label>
        <div className="flex gap-2">
          <Input
            id="settings-name"
            name="name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="name"
            placeholder="What should we call you?"
            className="h-[46px] min-w-0 flex-1 rounded-[14px] border-[1.5px] border-line px-3.5 md:text-[15px]"
          />
          {dirty && (
            <Button
              type="submit"
              disabled={pending}
              className="ft-pop h-[46px] rounded-[14px] px-[18px] text-sm font-semibold"
            >
              {pending ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
        {state.status === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : (
          <p className="text-[13px] text-ink-muted">
            Used in your greeting. Signed in as {email}.
          </p>
        )}
      </form>
    </div>
  );
}
