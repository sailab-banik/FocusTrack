import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { listCategories } from "@/features/categories/queries";
import { listProjects } from "@/features/projects/queries";
import { listPastSessions } from "@/features/sessions/queries";
import { HistoryFeed } from "@/features/sessions/history-feed";
import { getTimeZone } from "@/features/timezone/time-zone";

export const metadata: Metadata = { title: "History · FocusTrack" };

export default async function HistoryPage() {
  const [{ sessions, hasMore }, projects, categories, timeZone] =
    await Promise.all([
      listPastSessions(null),
      listProjects(),
      listCategories(),
      getTimeZone(),
    ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <PageHeader
        title="History"
        action={
          <Link
            href="/sessions/new"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-10 px-3.5",
            })}
          >
            <Plus />
            Add session
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <p className="text-muted-foreground">
          No sessions yet. Start one from the timer, or add one you forgot to
          track.
        </p>
      ) : (
        <HistoryFeed
          initialSessions={sessions}
          initialHasMore={hasMore}
          projects={projects}
          categories={categories}
          timeZone={timeZone}
          now={new Date().toISOString()}
        />
      )}
    </main>
  );
}
