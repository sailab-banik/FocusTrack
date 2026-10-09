import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { listCategories } from "@/features/categories/queries";
import { listProjects } from "@/features/projects/queries";
import { listPastSessions } from "@/features/sessions/queries";
import { SessionHistory } from "@/features/sessions/session-history";
import { getTimeZone } from "@/features/timezone/time-zone";

export const metadata: Metadata = { title: "History · FocusTrack" };

export default async function HistoryPage({
  searchParams,
}: PageProps<"/sessions">) {
  const { before } = await searchParams;
  const beforeDate = parseBefore(before);
  const [{ sessions, hasMore }, projects, categories, timeZone] =
    await Promise.all([
      listPastSessions(beforeDate),
      listProjects(),
      listCategories(),
      getTimeZone(),
    ]);
  const oldest = sessions.at(-1);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">History</h1>
        <Link
          href="/sessions/new"
          className={buttonVariants({ variant: "outline" })}
        >
          Add session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {beforeDate
            ? "No older sessions."
            : "No sessions yet. Start one from the timer, or add one you " +
              "forgot to track."}
        </p>
      ) : (
        <SessionHistory
          sessions={sessions}
          projectNames={new Map(projects.map((p) => [p.id, p.name]))}
          categoryNames={new Map(categories.map((c) => [c.id, c.name]))}
          timeZone={timeZone}
          now={new Date()}
        />
      )}

      {hasMore && oldest && (
        <Link
          href={`/sessions?before=${encodeURIComponent(oldest.startedAt)}`}
          className={buttonVariants({
            variant: "ghost",
            className: "self-center",
          })}
        >
          Show older sessions
        </Link>
      )}
    </main>
  );
}

function parseBefore(value: string | string[] | undefined): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
