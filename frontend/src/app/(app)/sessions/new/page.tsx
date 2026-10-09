import type { Metadata } from "next";
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Add session</h1>
        <p className="text-sm text-muted-foreground">
          For work you did but did not time.
        </p>
      </div>
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
          description: "",
          outcome: "",
          energy: null,
          difficulty: null,
          notes: "",
        }}
        maxDateTime={nowInput}
        projects={projects.filter((p) => !p.archived)}
        categories={categories}
        submitLabel="Add session"
      />
    </main>
  );
}
