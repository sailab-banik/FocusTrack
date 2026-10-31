import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Sign in · FocusTrack" };

const ERRORS: Record<string, string> = {
  confirmation:
    "That confirmation link is invalid or has expired. Sign in, or sign up again to get a new link.",
  link: "That did not go through. The link may have expired, or been opened in a different browser from the one that asked for it. Try again.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <>
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <AuthForm mode="sign-in" />
    </>
  );
}
