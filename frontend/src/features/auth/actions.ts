"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCredentials } from "./credentials";
import { HOME_PATH, SIGN_IN_PATH } from "./routes";

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
  if (error) return { status: "error", message: error.message };

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
  if (error) return { status: "error", message: error.message };

  // No session means the project requires email confirmation first.
  if (!data.session) {
    return { status: "check-email", email: parsed.credentials.email };
  }
  redirect(HOME_PATH);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(SIGN_IN_PATH);
}
