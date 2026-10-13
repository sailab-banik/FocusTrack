"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { getTimeZone } from "@/features/timezone/time-zone";
import { writeWeeklyReview } from "./write-review";

export type ReviewState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function requestWeeklyReview(): Promise<ReviewState> {
  await requireUser();
  const timeZone = await getTimeZone();

  // Caught so a provider outage shows a retry message instead of an error
  // page; the numbers on the page do not depend on it.
  let outcome;
  try {
    outcome = await writeWeeklyReview(new Date(), timeZone);
  } catch (error) {
    console.error("Weekly review failed", error);
    return {
      status: "error",
      message: "The review could not be written. Try again in a minute.",
    };
  }
  if (outcome === "not-configured") {
    return { status: "error", message: "AI is off on this server." };
  }
  if (outcome === "no-sessions") {
    return {
      status: "error",
      message: "Finish a session this week, then ask for a review.",
    };
  }
  refresh();
  return { status: "idle" };
}
