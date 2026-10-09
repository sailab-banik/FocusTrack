export const MIN_PASSWORD_LENGTH = 8;

export type Credentials = { email: string; password: string };

export type CredentialsResult =
  | { ok: true; credentials: Credentials }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseCredentials(formData: FormData): CredentialsResult {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { ok: false, error: "Email and password are required." };
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  return { ok: true, credentials: { email: trimmedEmail, password } };
}
