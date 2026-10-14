import type { Metadata } from "next";
import { requireUser } from "@/features/auth/current-user";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export const metadata: Metadata = { title: "New password · FocusTrack" };

// Reached signed in, through the link in the reset email.
export default async function ResetPasswordPage() {
  const user = await requireUser();
  return <ResetPasswordForm email={user.email} />;
}
