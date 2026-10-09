import { cookies } from "next/headers";
import type { Project } from "@/features/projects/queries";
import { listSessionSpans } from "@/features/sessions/queries";
import {
  DISMISSED_NUDGES_COOKIE,
  parseDismissed,
  revisitKey,
} from "./dismissals";
import { findRevisitNudges, LOOKBACK_DAYS, type RevisitNudge } from "./revisit";

const MAX_SHOWN = 2;

/** Takes the projects as a promise so the page can load everything at once. */
export async function getRevisitNudges(
  projects: Promise<Project[]>,
  now: Date,
  timeZone: string,
): Promise<RevisitNudge[]> {
  // One extra day covers timezones ahead of UTC.
  const since = new Date(now.getTime() - (LOOKBACK_DAYS + 1) * 86_400_000);
  const [spans, store] = await Promise.all([listSessionSpans(since), cookies()]);
  const dismissed = parseDismissed(store.get(DISMISSED_NUDGES_COOKIE)?.value);

  return findRevisitNudges(spans, await projects, now, timeZone)
    .filter((nudge) => !dismissed.includes(revisitKey(nudge)))
    .slice(0, MAX_SHOWN);
}
