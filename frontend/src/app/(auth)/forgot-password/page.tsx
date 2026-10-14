import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset password · FocusTrack" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
