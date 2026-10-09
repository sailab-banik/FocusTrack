export function durationSeconds(startedAt: Date, endedAt: Date): number {
  return Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
}

/** Worked time of a finished session: start to end, minus pauses. */
export function sessionSeconds(session: {
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
}): number {
  return (
    durationSeconds(new Date(session.startedAt), new Date(session.endedAt)) -
    session.pausedSeconds
  );
}

/**
 * Worked time of a session in progress. Frozen at the pause while paused.
 * Never negative: the device clock can run behind the server's.
 */
export function runningSeconds(
  session: {
    startedAt: string;
    pausedAt: string | null;
    pausedSeconds: number;
  },
  now: Date,
): number {
  const until = session.pausedAt ? new Date(session.pausedAt) : now;
  return Math.max(
    0,
    durationSeconds(new Date(session.startedAt), until) - session.pausedSeconds,
  );
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mmss = `${pad(minutes)}:${pad(seconds)}`;
  return hours === 0 ? mmss : `${hours}:${mmss}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
