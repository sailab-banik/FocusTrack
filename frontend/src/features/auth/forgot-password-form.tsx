"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, type AuthFormState } from "./actions";
import { AuthHeading } from "./auth-heading";
import { SIGN_IN_PATH } from "./routes";

const initialState: AuthFormState = { status: "idle" };

const LINK = "font-medium text-foreground underline underline-offset-4";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.status === "check-email") {
    return (
      <>
        <AuthHeading title="Check your email">
          If {state.email} has an account, a link to set a new password is on
          its way. Open it in this browser.
        </AuthHeading>
        <p className="text-sm text-muted-foreground">
          <Link href={SIGN_IN_PATH} className={LINK}>
            Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="Reset your password">
        Enter your account email and we will send a link to set a new one.
      </AuthHeading>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            autoFocus
            className="h-11"
          />
        </div>

        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href={SIGN_IN_PATH} className={LINK}>
          Back to sign in
        </Link>
      </p>
    </>
  );
}
