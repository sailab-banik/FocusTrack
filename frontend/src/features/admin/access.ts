import "server-only";
import { notFound } from "next/navigation";
import { requireUser, type CurrentUser } from "@/features/auth/current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailInList } from "./email-list";

export function isAdminEmail(email: string): boolean {
  return emailInList(process.env.ADMIN_EMAILS, email);
}

/**
 * The one gate to admin data. The address must also be confirmed, read from
 * the auth server rather than the token's metadata, which users can edit, so
 * nobody can sign up with an admin's address and be let in. Anyone else gets a
 * 404: the page does not admit to existing.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  const client = createAdminClient();
  if (!client || !isAdminEmail(user.email)) notFound();

  const { data, error } = await client.auth.admin.getUserById(user.id);
  if (error) throw error;
  if (!data.user.email_confirmed_at) notFound();
  return user;
}
