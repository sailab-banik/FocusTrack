import "server-only";
import { firstDayOfRange, RANGES, type Range, type VisitorCounts } from "./overview";

const ENDPOINT = "https://api.vercel.com/v1/query/web-analytics/visits/count";
const TIMEOUT_MS = 5000;

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
  if (!response.ok) {
    throw new Error(`Vercel Web Analytics responded ${response.status}`);
  }
  const body: { data?: { visitors?: unknown } } = await response.json();
  if (typeof body.data?.visitors !== "number") {
    throw new Error("Vercel Web Analytics returned no visitor count");
  }
  return body.data.visitors;
}

/**
 * Null for a range means unavailable. The overview must still load when these
 * are unset or Vercel is down, since everything else on it comes from the database.
 */
export async function loadVisitors(
  now: Date,
): Promise<Record<Range, VisitorCounts | null>> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  // Set by Vercel on deployments, so it is absent in local development.
  const projectId = process.env.VERCEL_PROJECT_ID;

  const entries = await Promise.all(
    RANGES.map(async (range): Promise<[Range, VisitorCounts | null]> => {
      if (!token || !teamId || !projectId) return [range, null];
      const params = {
        projectId,
        teamId,
        since: `${firstDayOfRange(range, now)}T00:00:00.000Z`,
        until: now.toISOString(),
      };
      try {
        const [welcome, signup] = await Promise.all([
          countVisitors("/welcome", params, token),
          countVisitors("/signup", params, token),
        ]);
        return [range, { welcome, signup }];
      } catch (error) {
        console.error(`Visitor counts failed for ${range} days`, error);
        return [range, null];
      }
    }),
  );
  return Object.fromEntries(entries) as Record<Range, VisitorCounts | null>;
}
