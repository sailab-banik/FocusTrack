"use server";

import { cookies } from "next/headers";
import { requireUser } from "@/features/auth/current-user";
import {
  DISMISSED_NUDGES_COOKIE,
  isNudgeKey,
  parseDismissed,
  withDismissed,
} from "./dismissals";

const SIXTY_DAYS_SECONDS = 60 * 24 * 60 * 60;

// Setting a cookie in an action re-renders the page, which drops the nudge.
export async function dismissNudge(key: string): Promise<void> {
  await requireUser();
  if (!isNudgeKey(key)) throw new Error("Invalid nudge key");
  const store = await cookies();
  const dismissed = withDismissed(
    parseDismissed(store.get(DISMISSED_NUDGES_COOKIE)?.value),
    key,
  );
  store.set(DISMISSED_NUDGES_COOKIE, dismissed.join(","), {
    path: "/",
    maxAge: SIXTY_DAYS_SECONDS,
    sameSite: "lax",
    httpOnly: true,
  });
}
