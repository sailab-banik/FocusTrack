"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthFormState } from "./actions";
import { MIN_PASSWORD_LENGTH } from "./credentials";

const MODES = {
  "sign-in": {
    action: signIn,
    title: "Sign in",
    submit: "Sign in",
    pending: "Signing in…",
    passwordAutoComplete: "current-password",
    switchPrompt: "No account yet?",
    switchLabel: "Create one",
    switchHref: "/signup",
  },
  "sign-up": {
    action: signUp,
    title: "Create your account",
    submit: "Create account",
    pending: "Creating account…",
    passwordAutoComplete: "new-password",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
} as const;

const initialState: AuthFormState = { status: "idle" };

export function AuthForm({ mode }: { mode: keyof typeof MODES }) {
  const config = MODES[mode];
  const [state, formAction, pending] = useActionState(
    config.action,
    initialState,
  );

  if (state.status === "check-email") {
    return (
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to {state.email}. Open it to finish
          creating your account.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{config.title}</h1>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={config.passwordAutoComplete}
          minLength={MIN_PASSWORD_LENGTH}
          required
          className="h-10"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? config.pending : config.submit}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {config.switchPrompt}{" "}
        <Link
          href={config.switchHref}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {config.switchLabel}
        </Link>
      </p>
    </form>
  );
}
