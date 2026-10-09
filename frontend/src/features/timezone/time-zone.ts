import { cookies } from "next/headers";
import { isValidTimeZone, TIME_ZONE_COOKIE } from "./zoned-time";

// Set by TimeZoneSync from the browser. UTC until the first sync.
export async function getTimeZone(): Promise<string> {
  const value = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return value && isValidTimeZone(value) ? value : "UTC";
}
