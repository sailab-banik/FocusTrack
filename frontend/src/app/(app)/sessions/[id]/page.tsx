import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getAiProvider } from "@/features/ai/get-provider";
import { listCategories } from "@/features/categories/queries";
import { EvaluationPanel } from "@/features/evaluations/evaluation-panel";
import { getEvaluation } from "@/features/evaluations/queries";
import { listProjects } from "@/features/projects/queries";
import { updateSession } from "@/features/sessions/actions";
import { DeleteSessionButton } from "@/features/sessions/delete-session-button";
import { getPastSession } from "@/features/sessions/queries";
import { SessionForm } from "@/features/sessions/session-form";
import { isUuid } from "@/lib/uuid";
import { getTimeZone } from "@/features/timezone/time-zone";
import { toLocalDateTimeInput } from "@/features/timezone/zoned-time";

export const metadata: Metadata = { title: "Session · FocusTrack" };

export default async function EditSessionPage({
  params,
}: PageProps<"/sessions/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [session, evaluation, projects, categories, timeZone] =
    await Promise.all([
      getPastSession(id),
      getEvaluation(id),
      listProjects(),
      listCategories(),
      getTimeZone(),
    ]);
  if (!session) notFound();

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 px-4 py-8 sm:py-12 lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-12">
      <div className="lg:col-span-2">
        <PageHeader title="Session" />
      </div>
      {/* Beside the form on wide screens, above it on narrow ones. */}
      <div className="lg:sticky lg:top-22 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:self-start">
        <EvaluationPanel
          sessionId={session.id}
          evaluation={evaluation}
          aiConfigured={getAiProvider() !== null}
          logged={Boolean(session.description && session.outcome)}
        />
      </div>
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
      <div className="border-t pt-6">
        <DeleteSessionButton sessionId={session.id} />
      </div>
    </main>
  );
}
