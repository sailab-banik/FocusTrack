"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  HOME_PATH,
  SETUP_READY_PATH,
} from "@/features/auth/routes";
import { requireUser } from "@/features/auth/current-user";
import {
  startSession,
  type SessionFormState,
} from "@/features/sessions/actions";
import { createClient } from "@/lib/supabase/server";
import { parseSetupInput } from "./setup-input";
import { SETUP_SKIPPED_COOKIE } from "./setup-skip";

export type SetupFormState =
  | { status: "idle" }
  | { status: "error"; message: string };

const UNIQUE_VIOLATION = "23505";

export async function completeSetup(
  _state: SetupFormState,
  formData: FormData,
): Promise<SetupFormState> {
  await requireUser();
  const parsed = parseSetupInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };
  const { projectName, why } = parsed.input;

  const supabase = await createClient();
  const { error: projectError } = await supabase
    .from("projects")
    .insert({ name: projectName, why });
  if (projectError?.code === UNIQUE_VIOLATION) {
    return {
      status: "error",
      message: `You already have a project named "${projectName}".`,
    };
  }
  if (projectError) throw projectError;

  redirect(SETUP_READY_PATH);
}

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

// A cookie, like other per-device choices: at worst another device asks again.
export async function skipSetup(): Promise<void> {
  await requireUser();
  (await cookies()).set(SETUP_SKIPPED_COOKIE, "1", {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: true,
  });
  redirect(HOME_PATH);
}

export async function startFirstSession(
  state: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const result = await startSession(state, formData);
  if (result.status === "error") return result;
  redirect(HOME_PATH);
}
