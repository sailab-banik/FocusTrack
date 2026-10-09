import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Create account · FocusTrack" };

export default function SignupPage() {
  return <AuthForm mode="sign-up" />;
}
