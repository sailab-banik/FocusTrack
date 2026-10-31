import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { listCategories } from "@/features/categories/queries";
import { listProjects } from "@/features/projects/queries";
import { createSession } from "@/features/sessions/actions";
import { getLastUsed } from "@/features/sessions/queries";
import { SessionForm } from "@/features/sessions/session-form";
import { getTimeZone } from "@/features/timezone/time-zone";
import { toLocalDateTimeInput } from "@/features/timezone/zoned-time";

export const metadata: Metadata = { title: "Add session · FocusTrack" };

const HOUR_MS = 3_600_000;

export default async function NewSessionPage() {
  const [projects, categories, lastUsed, timeZone] = await Promise.all([
    listProjects(),
    listCategories(),
    getLastUsed(),
    getTimeZone(),
  ]);
  const now = new Date();
  const nowInput = toLocalDateTimeInput(now, timeZone);

  return (
    <main className="flex w-full max-w-[1160px] flex-col gap-5 px-4 pt-1 pb-8 md:pt-[26px] md:pr-7 md:pb-14 md:pl-2">
      <PageHeader
        title="Add session"
        description="For work you did but did not time."
      />
      <SessionForm
        action={createSession}
        sessionId={null}
        values={{
          projectId: lastUsed?.projectId,
          categoryId: lastUsed?.categoryId,
          startedAt: toLocalDateTimeInput(
            new Date(now.getTime() - HOUR_MS),
            timeZone,
          ),
          endedAt: nowInput,
          outcome: "",
        }}
        maxDateTime={nowInput}
        projects={projects.filter((p) => !p.archived)}
        categories={categories}
        submitLabel="Add session"
      />
    </main>
  );
}
