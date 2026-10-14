"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updatePassword, type AuthFormState } from "./actions";
import { AuthHeading } from "./auth-heading";
import { MIN_PASSWORD_LENGTH } from "./credentials";
import { PasswordInput } from "./password-input";

const initialState: AuthFormState = { status: "idle" };

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <>
      <AuthHeading title="Set a new password">
        For {email}. You stay signed in after saving it.
      </AuthHeading>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            autoFocus
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-sm text-muted-foreground">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
        </div>

        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? "Saving…" : "Save password"}
        </Button>
      </form>
    </>
  );
}
