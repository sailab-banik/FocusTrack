import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { listCategories, type Category } from "@/features/categories/queries";
import { listProjects, type Project } from "@/features/projects/queries";
import {
  getLastUsed,
  getRunningSession,
  type RunningSession,
} from "@/features/sessions/queries";
import { RunningTimer } from "@/features/sessions/running-timer";
import { StartSessionForm } from "@/features/sessions/start-session-form";
import { TimerFace } from "@/features/sessions/timer-face";

export default async function TimerPage() {
  const [running, projects, categories, lastUsed] = await Promise.all([
    getRunningSession(),
    listProjects(),
    listCategories(),
    getLastUsed(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-8">
      {running ? (
        <ActiveSession
          running={running}
          projects={projects}
          categories={categories}
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

function ActiveSession({
  running,
  projects,
  categories,
}: {
  running: RunningSession;
  projects: Project[];
  categories: Category[];
}) {
  // Foreign keys keep a session's project and category from being removed.
  const project = projects.find((p) => p.id === running.projectId)!;
  const category = categories.find((c) => c.id === running.categoryId)!;

  return (
    <RunningTimer
      sessionId={running.id}
      startedAt={running.startedAt}
      pausedAt={running.pausedAt}
      pausedSeconds={running.pausedSeconds}
      projectName={project.name}
      categoryName={category.name}
      kind={category.kind}
    />
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
    <>
      {/* Decorative at rest, so short phones drop it to keep Start in view. */}
      <div
        aria-hidden
        className="hidden text-foreground/25 sm:block [@media(min-height:760px)]:block"
      >
        <TimerFace elapsedSeconds={0} />
      </div>
      <StartSessionForm
        projects={projects}
        categories={categories}
        lastUsed={lastUsed}
      />
    </>
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
    <div className="flex flex-col items-start gap-4">
      <p className="text-lg text-muted-foreground">{children}</p>
      <Link
        href={href}
        className={buttonVariants({ size: "lg", className: "h-10 px-4" })}
      >
        {linkText}
      </Link>
    </div>
  );
}
