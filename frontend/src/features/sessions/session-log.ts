export const MAX_COMMENT_LENGTH = 500;

export type SessionLog = { outcome: string; stoppedAt: Date };

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export type SessionLogResult =
  | { ok: true; log: SessionLog }
  | { ok: false; error: string };

export function parseSessionLog(formData: FormData): SessionLogResult {
  const comment = parseComment(formData);
  if (!comment.ok) return comment;

  const stoppedAtRaw = formData.get("stoppedAt");
  const stoppedAt =
    typeof stoppedAtRaw === "string" ? new Date(stoppedAtRaw) : null;
  if (stoppedAt === null || Number.isNaN(stoppedAt.getTime())) {
    return { ok: false, error: "Missing stop time. Stop the session again." };
  }

  return { ok: true, log: { outcome: comment.value, stoppedAt } };
}

/** The session's one required line: what got done. Stored as `outcome`. */
export function parseComment(formData: FormData): Result<string> {
  const value = formData.get("outcome");
  const comment = typeof value === "string" ? value.trim() : "";
  if (comment === "") {
    return { ok: false, error: "Add one line about what you got done." };
  }
  if (comment.length > MAX_COMMENT_LENGTH) {
    return {
      ok: false,
      error: `Keep it to ${MAX_COMMENT_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, value: comment };
}

// A session stopped while paused ended when the pause began. Otherwise the
// stop time comes from the client, so it is capped at the server's clock.
export function resolveEndedAt(
  stoppedAt: Date,
  now: Date,
  pausedAt: Date | null,
): Date {
  if (pausedAt) return pausedAt;
  return stoppedAt < now ? stoppedAt : now;
}
