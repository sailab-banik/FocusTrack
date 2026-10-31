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

export const metadata: Metadata = { title: "Log · FocusTrack" };

export default async function LogPage() {
  const [{ sessions, hasMore }, projects, categories, timeZone] =
    await Promise.all([
      listPastSessions(null),
      listProjects(),
      listCategories(),
      getTimeZone(),
    ]);

  return (
    <main className="flex w-full max-w-[1160px] flex-col gap-5 px-4 pt-1 pb-8 md:pt-[26px] md:pr-7 md:pb-14 md:pl-2">
      <PageHeader
        title="Log"
        action={
          <Link
            href="/log/new"
            className={buttonVariants({
              variant: "outline",
              className: "h-11 shrink-0 rounded-[14px] px-4 text-sm font-semibold",
            })}
          >
            <Plus />
            <span className="sr-only sm:not-sr-only">Add a past session</span>
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-paper px-6 py-12 text-center shadow-[0_1px_2px_rgb(31_27_61/.05),0_8px_24px_rgb(46_42_120/.06)]">
          <p className="font-serif text-[22px]">Nothing here yet</p>
          <p className="text-sm text-ink-soft">
            Your first session lands here when you stop it. You can also add one
            you forgot to track.
          </p>
        </div>
      ) : (
        <HistoryFeed
          // A delete from the side panel comes back to this page: start over.
          key={`${sessions[0].id}:${sessions.length}`}
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
