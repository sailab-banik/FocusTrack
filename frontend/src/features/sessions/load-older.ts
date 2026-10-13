"use server";

import { requireUser } from "@/features/auth/current-user";
import { listPastSessions } from "./queries";

/** The next page of history: sessions started before `before`. */
export async function loadOlderSessions(before: string) {
  await requireUser();
  const cursor = new Date(before);
  if (Number.isNaN(cursor.getTime())) throw new Error("Invalid cursor");
  return listPastSessions(cursor);
}
