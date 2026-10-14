"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authErrorMessage } from "./auth-errors";
import { parseCredentials, parseEmail, parsePassword } from "./credentials";
import { requireUser } from "./current-user";
import {
  CALLBACK_PATH,
  HOME_PATH,
  RESET_PASSWORD_PATH,
  SIGN_IN_PATH,
} from "./routes";

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "check-email"; email: string };

export async function signIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.credentials);
  if (error) return { status: "error", message: authErrorMessage(error) };

  redirect(HOME_PATH);
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.credentials);
  if (error) return { status: "error", message: authErrorMessage(error) };

  // No session means the project requires email confirmation first.
  if (!data.session) {
    return { status: "check-email", email: parsed.credentials.email };
  }
  redirect(HOME_PATH);
}

/**
 * Sends the browser to Google. It comes back to the callback route, which
 * signs the user in. Supabase links a Google sign-in to an existing account
 * with the same verified email, so the user's data stays in one place.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await requestOrigin()}${CALLBACK_PATH}` },
  });
  if (error) throw error;
  redirect(data.url);
}

/**
 * Emails a link that signs the user in and lands on the new-password page.
 * The answer is the same whether or not the email has an account.
 */
export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = parseEmail(formData);
  if (!email.ok) return { status: "error", message: email.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${await requestOrigin()}${CALLBACK_PATH}?next=${RESET_PASSWORD_PATH}`,
  });
  if (error) return { status: "error", message: authErrorMessage(error) };

  return { status: "check-email", email: email.value };
}

export async function updatePassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  await requireUser();
  const password = parsePassword(formData);
  if (!password.ok) return { status: "error", message: password.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password.value,
  });
  if (error) return { status: "error", message: authErrorMessage(error) };

  redirect(HOME_PATH);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(SIGN_IN_PATH);
}

// Next.js only runs an action whose Origin matches the host, and Supabase
// only redirects to URLs on the project's allow list.
async function requestOrigin(): Promise<string> {
  const origin = (await headers()).get("origin");
  if (!origin) throw new Error("Missing Origin header");
  return origin;
}
