"use server";

import { requireUser } from "@/features/auth/current-user";
import { setGuideDismissed } from "./dismissal";

// Setting a cookie in an action re-renders the page, which drops the guide.
export async function dismissGuide(): Promise<void> {
  await requireUser();
  await setGuideDismissed();
}
