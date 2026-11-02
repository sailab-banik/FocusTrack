import "server-only";
import { firstDayOfRange, RANGES, type Range, type VisitorCounts } from "./overview";

const ENDPOINT = "https://api.vercel.com/v1/query/web-analytics/visits/count";
const TIMEOUT_MS = 5000;
const SETTINGS = [
  "VERCEL_ANALYTICS_TOKEN",
  "VERCEL_TEAM_ID",
  "VERCEL_ANALYTICS_PROJECT_ID",
] as const;

export type VisitorResult =
  | { ok: true; counts: VisitorCounts }
  | { ok: false; reason: string };

async function countVisitors(
  path: string,
  params: Record<string, string>,
  token: string,
): Promise<number> {
  const query = new URLSearchParams({
    ...params,
    filter: `requestPath eq '${path}'`,
  });
  const response = await fetch(`${ENDPOINT}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body: { data?: { visitors?: unknown }; error?: { message?: string } } =
    await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.error?.message ? `: ${body.error.message}` : "";
    throw new Error(`Vercel responded ${response.status}${detail}`);
  }
  if (typeof body.data?.visitors !== "number") {
    throw new Error("Vercel returned no visitor count");
  }
  return body.data.visitors;
}

/**
 * The overview must still load when these are unset or Vercel is down, since
 * everything else on it comes from the database. The reason is shown on the
 * page, which only admins can open.
 */
export async function loadVisitors(
  now: Date,
): Promise<Record<Range, VisitorResult>> {
  const missing = SETTINGS.filter((name) => !process.env[name]);
  const entries = await Promise.all(
    RANGES.map(async (range): Promise<[Range, VisitorResult]> => {
      if (missing.length > 0) {
        return [range, { ok: false, reason: `${missing.join(", ")} not set` }];
      }
      const token = process.env.VERCEL_ANALYTICS_TOKEN!;
      const params = {
        projectId: process.env.VERCEL_ANALYTICS_PROJECT_ID!,
        teamId: process.env.VERCEL_TEAM_ID!,
        since: `${firstDayOfRange(range, now)}T00:00:00.000Z`,
        until: now.toISOString(),
      };
      try {
        const [welcome, signup] = await Promise.all([
          countVisitors("/welcome", params, token),
          countVisitors("/signup", params, token),
        ]);
        return [range, { ok: true, counts: { welcome, signup } }];
      } catch (error) {
        console.error(`Visitor counts failed for ${range} days`, error);
        const reason = error instanceof Error ? error.message : String(error);
        return [range, { ok: false, reason }];
      }
    }),
  );
  return Object.fromEntries(entries) as Record<Range, VisitorResult>;
}
