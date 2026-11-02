import { durationSeconds } from "./duration";

export const STALE_AFTER_HOURS = 12;
const MIN_SAVED_SECONDS = 60;

export type StaleOutcome = "discard" | "save";

/**
 * Twelve hours without a pause, or paused for twelve, means the timer was left
 * on. A running session's real end is unknown, so it is discarded rather than
 * saved with made-up hours. A paused one ended when the pause began, so it is
 * saved, unless it has no time worked to keep.
 */
export function staleOutcome(
  session: {
    startedAt: string;
    pausedAt: string | null;
    pausedSeconds: number;
    resumedAt: string | null;
  },
  now: Date,
): StaleOutcome | null {
  const limit = STALE_AFTER_HOURS * 3600;
  if (!session.pausedAt) {
    const stretch = durationSeconds(
      new Date(session.resumedAt ?? session.startedAt),
      now,
    );
    return stretch >= limit ? "discard" : null;
  }
  const pausedAt = new Date(session.pausedAt);
  if (durationSeconds(pausedAt, now) < limit) return null;
  const worked =
    durationSeconds(new Date(session.startedAt), pausedAt) -
    session.pausedSeconds;
  return worked >= MIN_SAVED_SECONDS ? "save" : "discard";
}

/** The line a saved session gets in place of one the user wrote. */
export function staleSessionLine(
  projectName: string,
  categoryName: string,
): string {
  return `${projectName} · ${categoryName}`;
}
