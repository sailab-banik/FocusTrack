import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  HOME_PATH,
  RESET_PASSWORD_PATH,
  SIGN_IN_PATH,
} from "@/features/auth/routes";
import { createClient } from "@/lib/supabase/server";

// Where Google sign-in and the password reset email come back to. The code
// only works in the browser that started the flow, which holds its verifier.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  if (!code) redirect(`${SIGN_IN_PATH}?error=link`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) redirect(`${SIGN_IN_PATH}?error=link`);

  // `next` is user input: the new-password page is the only place it may name.
  redirect(
    searchParams.get("next") === RESET_PASSWORD_PATH
      ? RESET_PASSWORD_PATH
      : HOME_PATH,
  );
}
