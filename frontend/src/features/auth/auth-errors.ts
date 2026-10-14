const TOO_MANY = "Too many attempts. Wait a minute, then try again.";

// Supabase's own wording is written for developers; these say what to do.
const MESSAGES: Record<string, string> = {
  invalid_credentials: "That email and password do not match an account.",
  email_not_confirmed:
    "Confirm your email first: open the link we sent when you signed up.",
  user_already_exists:
    "An account with that email already exists. Sign in instead.",
  email_exists: "An account with that email already exists. Sign in instead.",
  same_password: "That is already your password. Choose a different one.",
  over_request_rate_limit: TOO_MANY,
  over_email_send_rate_limit: TOO_MANY,
};

/** What to show for a Supabase auth error; its own message when unmapped. */
export function authErrorMessage(error: {
  code?: string;
  message: string;
}): string {
  return (error.code && MESSAGES[error.code]) || error.message;
}
