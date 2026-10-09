export const SIGN_IN_PATH = "/login";
export const HOME_PATH = "/";

const AUTH_PAGES = new Set([SIGN_IN_PATH, "/signup"]);

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.has(pathname);
}

export function isPublicPath(pathname: string): boolean {
  return isAuthPage(pathname) || pathname.startsWith("/auth/");
}
