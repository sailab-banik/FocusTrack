import { fromLocalDateTimeInput } from "@/features/timezone/zoned-time";
import { parseLogFields, type LogFields } from "./session-log";
import { parseStartInput, type StartInput } from "./start-input";

export type SessionInput = StartInput &
  LogFields & { startedAt: Date; endedAt: Date };

export type SessionInputResult =
  | { ok: true; input: SessionInput }
  | { ok: false; error: string };

export const MAX_SESSION_HOURS = 24;

const MINUTE_MS = 60_000;

/** Parses the add/edit session form. Times are wall-clock in `timeZone`. */
export function parseSessionInput(
  formData: FormData,
  timeZone: string,
  now: Date,
): SessionInputResult {
  const ids = parseStartInput(formData);
  if (!ids.ok) return ids;

  const startedAt = parseLocal(formData.get("startedAt"), timeZone);
  const endedAt = parseLocal(formData.get("endedAt"), timeZone);
  if (startedAt === null || endedAt === null) {
    return { ok: false, error: "Enter a valid start and end time." };
  }
  if (endedAt <= startedAt) {
    return { ok: false, error: "The end time must be after the start time." };
  }
  // Inputs have minute precision, so allow the current minute.
  if (endedAt.getTime() > now.getTime() + MINUTE_MS) {
    return { ok: false, error: "The end time cannot be in the future." };
  }
  if (endedAt.getTime() - startedAt.getTime() > MAX_SESSION_HOURS * 60 * MINUTE_MS) {
    return {
      ok: false,
      error: `A session cannot be longer than ${MAX_SESSION_HOURS} hours.`,
    };
  }

  const log = parseLogFields(formData);
  if (!log.ok) return log;

  return {
    ok: true,
    input: { ...ids.input, ...log.value, startedAt, endedAt },
  };
}

function parseLocal(
  value: FormDataEntryValue | null,
  timeZone: string,
): Date | null {
  return typeof value === "string"
    ? fromLocalDateTimeInput(value, timeZone)
    : null;
}
