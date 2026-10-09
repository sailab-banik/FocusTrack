import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { SIGN_IN_PATH } from "./routes";

export type CurrentUser = { id: string; email: string };

// getClaims verifies the JWT signature, unlike getSession, so the result can
// be trusted for authorization. Cached so a layout and page share one check.
export const requireUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) redirect(SIGN_IN_PATH);

  return { id: data.claims.sub, email: data.claims.email ?? "" };
});
