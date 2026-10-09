import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCategories } from "@/features/categories/queries";
import { listProjects } from "@/features/projects/queries";
import { updateSession } from "@/features/sessions/actions";
import { DeleteSessionButton } from "@/features/sessions/delete-session-button";
import { getPastSession } from "@/features/sessions/queries";
import { SessionForm } from "@/features/sessions/session-form";
import { isUuid } from "@/lib/uuid";
import { getTimeZone } from "@/features/timezone/time-zone";
import { toLocalDateTimeInput } from "@/features/timezone/zoned-time";

export const metadata: Metadata = { title: "Edit session · FocusTrack" };

export default async function EditSessionPage({
  params,
}: PageProps<"/sessions/[id]">) {
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold tracking-tight">Edit session</h1>
      <SessionForm
        action={updateSession}
        sessionId={session.id}
        values={{
          projectId: session.projectId,
          categoryId: session.categoryId,
          startedAt: toLocalDateTimeInput(new Date(session.startedAt), timeZone),
          endedAt: toLocalDateTimeInput(new Date(session.endedAt), timeZone),
          description: session.description ?? "",
          outcome: session.outcome ?? "",
          energy: session.energy,
          difficulty: session.difficulty,
          notes: session.notes ?? "",
        }}
        maxDateTime={toLocalDateTimeInput(new Date(), timeZone)}
        // Keep the session's own project selectable even if it is archived.
        projects={projects.filter(
          (p) => !p.archived || p.id === session.projectId,
        )}
        categories={categories}
        submitLabel="Save changes"
      />
      <div className="border-t pt-4">
        <DeleteSessionButton sessionId={session.id} />
      </div>
    </main>
  );
}
