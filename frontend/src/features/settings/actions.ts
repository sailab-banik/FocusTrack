"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { MAX_NAME_LENGTH } from "./name";

export type NameFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

// Kept on the auth user: a name is account data, not worth its own table.
export async function updateName(
  _state: NameFormState,
  formData: FormData,
): Promise<NameFormState> {
  await requireUser();
  const value = formData.get("name");
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length > MAX_NAME_LENGTH) {
    return {
      status: "error",
      message: `Keep it to ${MAX_NAME_LENGTH} characters or fewer.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { display_name: name },
  });
  if (error) return { status: "error", message: error.message };
  // The name is read from the session token, which still holds the old one.
  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) throw refreshError;
  refresh();
  return { status: "saved" };
}
