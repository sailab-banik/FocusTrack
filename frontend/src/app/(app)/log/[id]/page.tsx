import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { listCategories } from "@/features/categories/queries";
import { listProjects } from "@/features/projects/queries";
import { updateSession } from "@/features/sessions/actions";
import { DeleteSessionButton } from "@/features/sessions/delete-session-button";
import { formatDuration, sessionSeconds } from "@/features/sessions/duration";
import { getPastSession } from "@/features/sessions/queries";
import { SessionForm } from "@/features/sessions/session-form";
import { isUuid } from "@/lib/uuid";
import { getTimeZone } from "@/features/timezone/time-zone";
import { toLocalDateTimeInput } from "@/features/timezone/zoned-time";

export const metadata: Metadata = { title: "Session · FocusTrack" };

export default async function EditSessionPage({
  params,
}: PageProps<"/log/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [session, projects, categories, timeZone] = await Promise.all([
    getPastSession(id),
    listProjects(),
    listCategories(),
    getTimeZone(),
  ]);
  if (!session) notFound();

  return (
    <main className="flex w-full max-w-[1160px] flex-col gap-5 px-4 pt-1 pb-8 md:pt-[26px] md:pr-7 md:pb-14 md:pl-2">
      <PageHeader
        title="Session"
        description={
          session.pausedSeconds >= 60
            ? `${formatDuration(sessionSeconds(session))} worked, ${formatDuration(session.pausedSeconds)} paused.`
            : `${formatDuration(sessionSeconds(session))} worked.`
        }
      />
      <SessionForm
        action={updateSession}
        sessionId={session.id}
        values={{
          projectId: session.projectId,
          categoryId: session.categoryId,
          startedAt: toLocalDateTimeInput(new Date(session.startedAt), timeZone),
          endedAt: toLocalDateTimeInput(new Date(session.endedAt), timeZone),
          outcome: session.outcome ?? "",
        }}
        maxDateTime={toLocalDateTimeInput(new Date(), timeZone)}
        // Keep the session's own project selectable even if it is archived.
        projects={projects.filter(
          (p) => !p.archived || p.id === session.projectId,
        )}
        categories={categories}
        submitLabel="Save changes"
      />
      <div className="border-t pt-6">
        <DeleteSessionButton sessionId={session.id} />
      </div>
    </main>
  );
}
