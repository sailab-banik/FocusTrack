export const MIN_PASSWORD_LENGTH = 8;

export type Credentials = { email: string; password: string };

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export type CredentialsResult =
  | { ok: true; credentials: Credentials }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmail(formData: FormData): Result<string> {
  const email = formData.get("email");
  if (typeof email !== "string") {
    return { ok: false, error: "Enter your email address." };
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  return { ok: true, value: trimmedEmail };
}

/** The password is kept as typed: spaces at either end are part of it. */
export function parsePassword(formData: FormData): Result<string> {
  const password = formData.get("password");
  if (typeof password !== "string") {
    return { ok: false, error: "Enter a password." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  return { ok: true, value: password };
}

export function parseCredentials(formData: FormData): CredentialsResult {
  if (!formData.has("email") || !formData.has("password")) {
    return { ok: false, error: "Email and password are required." };
  }
  const email = parseEmail(formData);
  if (!email.ok) return email;
  const password = parsePassword(formData);
  if (!password.ok) return password;
  return {
    ok: true,
    credentials: { email: email.value, password: password.value },
  };
}
