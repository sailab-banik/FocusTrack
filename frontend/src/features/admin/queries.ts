import "server-only";
import { displayName } from "@/features/settings/name";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminReport,
  AdminSession,
  AdminUser,
} from "./overview";

const DAY_MS = 86_400_000;
const PAGE_SIZE = 1000;

/** Reads every page: the API caps each response at 1000 rows. */
async function allPages<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: Error | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data!);
    if (data!.length < PAGE_SIZE) return rows;
  }
}

/**
 * Everything the overview shows. The selects are the privacy boundary: usage
 * columns only, so no comment, project name, or report text leaves the database.
 * Callers must have passed requireAdmin().
 */
export async function loadAdminData(now: Date, days: number) {
  // requireAdmin() has already checked that the client exists.
  const client = createAdminClient()!;
  const since = new Date(now.getTime() - (days + 1) * DAY_MS).toISOString();

  const [authUsers, categories, sessions, reports] = await Promise.all([
    listAllUsers(),
    allPages((from, to) =>
      client.from("categories").select("id, kind").order("id").range(from, to),
    ),
    allPages((from, to) =>
      client
        .from("sessions")
        .select("id, user_id, category_id, started_at, ended_at, paused_seconds")
        .not("ended_at", "is", null)
        .gte("started_at", since)
        .order("id")
        .range(from, to),
    ),
    allPages((from, to) =>
      client
        .from("reports")
        .select(
          "id, user_id, period, model, claimed_at, written_at, input_tokens, output_tokens, write_ms, attempts, last_error, last_failed_at",
        )
        .gte("claimed_at", since)
        .order("id")
        .range(from, to),
    ),
  ]);

  return {
    users: authUsers,
    kinds: new Map(categories.map((c) => [c.id, c.kind])),
    sessions: sessions.map(
      (row): AdminSession => ({
        userId: row.user_id,
        categoryId: row.category_id,
        startedAt: row.started_at,
        // The query filters out running sessions.
        endedAt: row.ended_at!,
        pausedSeconds: row.paused_seconds,
      }),
    ),
    reports: reports.map(
      (row): AdminReport => ({
        userId: row.user_id,
        // The table only accepts the three period kinds.
        kind: row.period as AdminReport["kind"],
        model: row.model,
        claimedAt: row.claimed_at,
        writtenAt: row.written_at,
        inputTokens: row.input_tokens,
        outputTokens: row.output_tokens,
        writeMs: row.write_ms,
        attempts: row.attempts,
        lastError: row.last_error,
        lastFailedAt: row.last_failed_at,
      }),
    ),
  };
}

async function listAllUsers(): Promise<AdminUser[]> {
  const client = createAdminClient()!;
  const users: AdminUser[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) throw error;
    users.push(
      ...data.users.map((user) => ({
        id: user.id,
        email: user.email ?? "",
        name: displayName(user.user_metadata),
        createdAt: user.created_at,
      })),
    );
    if (data.users.length < PAGE_SIZE) return users;
  }
}
