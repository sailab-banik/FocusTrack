"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthFormState } from "./actions";
import { AuthHeading } from "./auth-heading";
import { CheckInbox } from "./check-inbox";
import { MIN_PASSWORD_LENGTH } from "./credentials";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";
import {
  FORGOT_PASSWORD_PATH,
  SIGN_IN_PATH,
  WELCOME_PATH,
} from "./routes";

const MODES = {
  "sign-in": {
    action: signIn,
    title: "Welcome back.",
    lead: "Pick up where your last session left off.",
    submit: "Log in",
    pending: "Logging in…",
    passwordAutoComplete: "current-password",
    switchPrompt: "New here?",
    switchLabel: "See how it works",
    switchHref: WELCOME_PATH,
  },
  "sign-up": {
    action: signUp,
    title: "Make it yours.",
    lead: "An account keeps your sessions in sync on your phone and your computer.",
    submit: "Create account",
    pending: "Creating account…",
    passwordAutoComplete: "new-password",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    switchHref: SIGN_IN_PATH,
  },
} as const;

const initialState: AuthFormState = { status: "idle" };

const LINK = "font-bold text-indigo";

export function AuthForm({ mode }: { mode: keyof typeof MODES }) {
  // Remounting is what clears the "check your inbox" result of the action.
  const [attempt, setAttempt] = useState(0);
  return (
    <AuthFormAttempt
      key={attempt}
      mode={mode}
      onRestart={() => setAttempt((count) => count + 1)}
    />
  );
}

function AuthFormAttempt({
  mode,
  onRestart,
}: {
  mode: keyof typeof MODES;
  onRestart: () => void;
}) {
  const config = MODES[mode];
  const [state, formAction, pending] = useActionState(
    config.action,
    initialState,
  );
  const [emailOpen, setEmailOpen] = useState(false);
  const emailHidden = mode === "sign-up" && !emailOpen;

  if (state.status === "check-email") {
    return <CheckInbox email={state.email} onUseAnotherEmail={onRestart} />;
  }

  return (
    <>
      <AuthHeading title={config.title}>{config.lead}</AuthHeading>

      <GoogleButton />

      {/* Signing up on a phone, the form opens on request; see DESIGN.md. */}
      {emailHidden && (
        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          className="h-14 cursor-pointer rounded-2xl bg-paper text-[15px] font-semibold shadow-[0_1px_2px_rgb(31_27_61/.06),0_6px_16px_rgb(46_42_120/.08)] lg:hidden"
        >
          Continue with email
        </button>
      )}
      <div
        className={cn(
          "items-center gap-3 text-[13px] text-ink-muted",
          emailHidden ? "hidden lg:flex" : "flex",
        )}
      >
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        action={formAction}
        className={cn(
          "flex-col gap-3.5",
          emailHidden ? "hidden lg:flex" : "flex",
        )}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="password">Password</Label>
            {mode === "sign-in" && (
              <Link
                href={FORGOT_PASSWORD_PATH}
                className="text-[13px] font-semibold text-indigo"
              >
                Forgot it?
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
            <p id="password-hint" className="text-[13px] text-ink-muted">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" className="mt-1.5" disabled={pending}>
          {pending ? config.pending : config.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        {config.switchPrompt}{" "}
        <Link href={config.switchHref} className={LINK}>
          {config.switchLabel}
        </Link>
      </p>
      {mode === "sign-up" && (
        <Link
          href={WELCOME_PATH}
          className="flex h-11 items-center justify-center text-sm font-semibold text-ink-soft"
        >
          Back to the tour
        </Link>
      )}
    </>
  );
}
