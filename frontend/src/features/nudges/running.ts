import { durationSeconds } from "@/features/sessions/duration";

export const BREAK_AFTER_SECONDS = 90 * 60;
export const LONG_PAUSE_SECONDS = 30 * 60;

export type RunningNudge =
  | { type: "break"; stretchSeconds: number }
  | { type: "long-pause"; pausedSeconds: number };

/**
 * What a session in progress calls for right now, if anything: a break after
 * a long uninterrupted stretch, or a decision about a pause that has dragged on.
 */
export function runningNudge(
  session: {
    startedAt: string;
    pausedAt: string | null;
    resumedAt: string | null;
  },
  now: Date,
): RunningNudge | null {
  if (session.pausedAt) {
    const pausedSeconds = durationSeconds(new Date(session.pausedAt), now);
    return pausedSeconds >= LONG_PAUSE_SECONDS
      ? { type: "long-pause", pausedSeconds }
      : null;
  }
  const stretchSeconds = durationSeconds(
    new Date(session.resumedAt ?? session.startedAt),
    now,
  );
  return stretchSeconds >= BREAK_AFTER_SECONDS
    ? { type: "break", stretchSeconds }
    : null;
}
