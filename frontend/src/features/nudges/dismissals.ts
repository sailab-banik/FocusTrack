// Dismissed nudges live in a cookie: they are a per-device convenience, not
// data worth a table. A key names one lapse (a project and the day it was last
// worked on), so a later lapse of the same project is nudged again.

export const DISMISSED_NUDGES_COOKIE = "dismissed_nudges";

const KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:\d{4}-\d{2}-\d{2}$/i;
const MAX_KEPT = 30;

export function revisitKey(nudge: {
  projectId: string;
  lastDayKey: string;
}): string {
  return `${nudge.projectId}:${nudge.lastDayKey}`;
}

export function isNudgeKey(value: string): boolean {
  return KEY_PATTERN.test(value);
}

export function parseDismissed(cookieValue: string | undefined): string[] {
  return (cookieValue ?? "").split(",").filter(isNudgeKey);
}

/** Adds a key, keeping only the most recent ones so the cookie stays small. */
export function withDismissed(keys: string[], key: string): string[] {
  return [...keys.filter((kept) => kept !== key), key].slice(-MAX_KEPT);
}
