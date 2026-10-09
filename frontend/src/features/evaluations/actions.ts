"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/features/auth/current-user";
import { isUuid } from "@/lib/uuid";
import { evaluateSession } from "./evaluate";

export type EvaluateState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function evaluateSessionNow(
  sessionId: string,
): Promise<EvaluateState> {
  await requireUser();
  if (!isUuid(sessionId)) throw new Error("Invalid session id");

  // Caught so a provider outage shows a retry message instead of an error
  // page; the session itself is unaffected.
  let outcome;
  try {
    outcome = await evaluateSession(sessionId);
  } catch (error) {
    console.error("Session evaluation failed", error);
    return {
      status: "error",
      message: "The evaluation failed. Your session is saved; try again later.",
    };
  }
  if (outcome === "not-logged") {
    return {
      status: "error",
      message: "Add a description and outcome before evaluating.",
    };
  }
  refresh();
  return { status: "idle" };
}
