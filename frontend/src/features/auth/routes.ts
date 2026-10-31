export const WELCOME_PATH = "/welcome";
export const SIGN_IN_PATH = "/login";
export const SIGN_UP_PATH = "/signup";
export const SETUP_PATH = "/setup";
export const SETUP_READY_PATH = "/setup/ready";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const RESET_PASSWORD_PATH = "/reset-password";
export const CALLBACK_PATH = "/auth/callback";
export const HOME_PATH = "/";

// Pages for signed-out visitors; a signed-in one is sent home.
const AUTH_PAGES = new Set([
  WELCOME_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  FORGOT_PASSWORD_PATH,
]);

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.has(pathname);
}

export function isPublicPath(pathname: string): boolean {
  return isAuthPage(pathname) || pathname.startsWith("/auth/");
}
