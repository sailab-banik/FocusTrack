import { cookies } from "next/headers";

// A per-device convenience like dismissed nudges, so a cookie rather than a
// column. Once the first session is logged the guide stops showing anyway.
const GUIDE_DISMISSED_COOKIE = "guide_dismissed";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export async function isGuideDismissed(): Promise<boolean> {
  return (await cookies()).has(GUIDE_DISMISSED_COOKIE);
}

export async function setGuideDismissed(): Promise<void> {
  (await cookies()).set(GUIDE_DISMISSED_COOKIE, "1", {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: true,
  });
}
