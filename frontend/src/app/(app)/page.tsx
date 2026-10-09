import Link from "next/link";
import { listCategories } from "@/features/categories/queries";
import { listProjects } from "@/features/projects/queries";
import { getLastUsed, getRunningSession } from "@/features/sessions/queries";
import { RunningTimer } from "@/features/sessions/running-timer";
import { StartSessionForm } from "@/features/sessions/start-session-form";

export default async function TimerPage() {
  const [running, projects, categories, lastUsed] = await Promise.all([
    getRunningSession(),
    listProjects(),
    listCategories(),
    getLastUsed(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-4">
      {running ? (
        <RunningTimer
          sessionId={running.id}
          startedAt={running.startedAt}
          projectName={nameOf(projects, running.projectId)}
          categoryName={nameOf(categories, running.categoryId)}
        />
      ) : (
        <StartPanel
          projects={projects.filter((p) => !p.archived)}
          categories={categories}
          lastUsed={lastUsed}
        />
      )}
    </main>
  );
}

function StartPanel({
  projects,
  categories,
  lastUsed,
}: Parameters<typeof StartSessionForm>[0]) {
  if (projects.length === 0) {
    return (
      <EmptyState href="/projects" linkText="Add a project">
        Sessions are logged against a project. Add one to start tracking.
      </EmptyState>
    );
  }
  if (categories.length === 0) {
    return (
      <EmptyState href="/categories" linkText="Add a category">
        Sessions need a category. Add one to start tracking.
      </EmptyState>
    );
  }
  return (
    <StartSessionForm
      projects={projects}
      categories={categories}
      lastUsed={lastUsed}
    />
  );
}

function EmptyState({
  href,
  linkText,
  children,
}: {
  href: string;
  linkText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link
        href={href}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        {linkText}
      </Link>
    </div>
  );
}

function nameOf(options: { id: string; name: string }[], id: string): string {
  return options.find((option) => option.id === id)?.name ?? "";
}
