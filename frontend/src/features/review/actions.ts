"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { after } from "next/server";
import { getAiProvider } from "@/features/ai/get-provider";
import { requireUser } from "@/features/auth/current-user";
import { isValidTimeZone } from "@/features/timezone/zoned-time";
import { REPORTS_SEEN_COOKIE } from "./notices";
import { claimDueReports, writeReport } from "./write-report";

/**
 * Called when the app is opened. Claims the reports that are due and writes
 * them after the response is sent, so nothing waits on the AI provider. A
 * failed write is logged by Next.js and retried on a later open.
 *
 * The timezone comes from the browser rather than the `tz` cookie because the
 * cookie is still unset on a first visit, and a report for a day that has not
 * ended in the user's timezone could never be rewritten.
 */
export async function requestDueReports(timeZone: string): Promise<void> {
  await requireUser();
  if (typeof timeZone !== "string" || !isValidTimeZone(timeZone)) {
    throw new Error("Invalid timezone");
  }
  const provider = getAiProvider();
  if (!provider) return;

  const claims = await claimDueReports(new Date(), timeZone);
  if (claims.length === 0) return;
  for (const claim of claims) {
    after(() => writeReport(provider, claim, timeZone));
  }
  // Shows the reports as being written and starts the wait for them.
  refresh();
}

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

// Setting a cookie in an action re-renders the page, which clears the bell.
export async function markReportsSeen(): Promise<void> {
  await requireUser();
  (await cookies()).set(REPORTS_SEEN_COOKIE, String(Date.now()), {
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
    sameSite: "lax",
    httpOnly: true,
  });
}
