import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { HOME_PATH, SIGN_IN_PATH } from "@/features/auth/routes";
import { createClient } from "@/lib/supabase/server";

// Target of the confirmation email link. Uses token_hash rather than a PKCE
// code so the link also works when opened on a different device.
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  if (!tokenHash || !type) redirect(`${SIGN_IN_PATH}?error=confirmation`);

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  if (error) redirect(`${SIGN_IN_PATH}?error=confirmation`);

  redirect(HOME_PATH);
}
