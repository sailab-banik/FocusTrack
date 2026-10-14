"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthFormState } from "./actions";
import { AuthHeading } from "./auth-heading";
import { MIN_PASSWORD_LENGTH } from "./credentials";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";
import { FORGOT_PASSWORD_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "./routes";

const MODES = {
  "sign-in": {
    action: signIn,
    title: "Sign in",
    lead: "Pick up where your last session left off.",
    submit: "Sign in",
    pending: "Signing in…",
    passwordAutoComplete: "current-password",
    switchPrompt: "No account yet?",
    switchLabel: "Create one",
    switchHref: SIGN_UP_PATH,
  },
  "sign-up": {
    action: signUp,
    title: "Create your account",
    lead: "Start timing your work and see what it turns into.",
    submit: "Create account",
    pending: "Creating account…",
    passwordAutoComplete: "new-password",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: SIGN_IN_PATH,
  },
} as const;

// Off until the Google provider is set up in Supabase; see CLAUDE.md.
const GOOGLE_SIGN_IN: boolean = false;

const initialState: AuthFormState = { status: "idle" };

const LINK = "font-medium text-foreground underline underline-offset-4";

export function AuthForm({ mode }: { mode: keyof typeof MODES }) {
  const config = MODES[mode];
  const [state, formAction, pending] = useActionState(
    config.action,
    initialState,
  );

  if (state.status === "check-email") {
    return (
      <>
        <AuthHeading title="Check your email">
          We sent a confirmation link to {state.email}. Open it to finish
          creating your account.
        </AuthHeading>
        <p className="text-sm text-muted-foreground">
          Already confirmed?{" "}
          <Link href={SIGN_IN_PATH} className={LINK}>
            Sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <AuthHeading title={config.title}>{config.lead}</AuthHeading>

      {GOOGLE_SIGN_IN && (
        <>
          <GoogleButton />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or with email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="password">Password</Label>
            {mode === "sign-in" && (
              <Link
                href={FORGOT_PASSWORD_PATH}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete={config.passwordAutoComplete}
            minLength={MIN_PASSWORD_LENGTH}
            required
            aria-describedby={mode === "sign-up" ? "password-hint" : undefined}
          />
          {mode === "sign-up" && (
            <p id="password-hint" className="text-sm text-muted-foreground">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? config.pending : config.submit}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {config.switchPrompt}{" "}
        <Link href={config.switchHref} className={LINK}>
          {config.switchLabel}
        </Link>
      </p>
    </>
  );
}
