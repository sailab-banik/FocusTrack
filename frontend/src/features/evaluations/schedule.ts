import { after } from "next/server";
import { evaluateSession } from "./evaluate";

/**
 * Evaluates the session after the response is sent, so saving never waits
 * on the AI provider. A failure is logged by Next.js and leaves the session
 * unevaluated; the user can retry from the session page.
 */
export function scheduleEvaluation(sessionId: string): void {
  after(() => evaluateSession(sessionId));
}
