// Timezone math with Intl only. Day boundaries and datetime inputs must use
// the user's timezone, but pages render on a server running in UTC.

export const TIME_ZONE_COOKIE = "tz";

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

type Parts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function zonedParts(date: Date, timeZone: string): Parts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** YYYY-MM-DD of the instant in the given timezone. */
export function localDayKey(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Value for <input type="datetime-local">: YYYY-MM-DDTHH:mm. */
export function toLocalDateTimeInput(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Wall-clock time as HH:mm in the given timezone. */
export function formatLocalTime(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** Parses a datetime-local value as wall-clock time in the given timezone. */
export function fromLocalDateTimeInput(
  value: string,
  timeZone: string,
): Date | null {
  const match = LOCAL_DATE_TIME.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  if (Number.isNaN(wallClockAsUtc)) return null;

  // Guess with the offset at the wall-clock instant, then correct once in
  // case the guess crossed a DST transition.
  let instant = wallClockAsUtc - offsetMs(new Date(wallClockAsUtc), timeZone);
  instant = wallClockAsUtc - offsetMs(new Date(instant), timeZone);
  return new Date(instant);
}

function offsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const zonedAsUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  const wholeSeconds = Math.floor(date.getTime() / 1000) * 1000;
  return zonedAsUtc - wholeSeconds;
}
