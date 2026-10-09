import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Sign in · FocusTrack" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <>
      {error === "confirmation" && (
        <p role="alert" className="text-sm text-destructive">
          That confirmation link is invalid or has expired. Sign in, or sign up
          again to get a new link.
        </p>
      )}
      <AuthForm mode="sign-in" />
    </>
  );
}
