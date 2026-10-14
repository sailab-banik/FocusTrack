import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { listCategories, type Category } from "@/features/categories/queries";
import { isGuideDismissed } from "@/features/guide/dismissal";
import { FirstRunGuide } from "@/features/guide/first-run-guide";
import { getRevisitNudges } from "@/features/nudges/queries";
import { RevisitNudges } from "@/features/nudges/revisit-nudges";
import { listProjects, type Project } from "@/features/projects/queries";
import {
  getLastUsed,
  getRunningSession,
  listSessionSpans,
} from "@/features/sessions/queries";
import { StartSessionForm } from "@/features/sessions/start-session-form";
import { TimerFace } from "@/features/sessions/timer-face";
import { TimerScreen } from "@/features/sessions/timer-screen";
import { TodayPanel } from "@/features/sessions/today-panel";
import { getTimeZone } from "@/features/timezone/time-zone";
import {
  formatLongDate,
  startOfLocalDay,
} from "@/features/timezone/zoned-time";

export default async function TimerPage({ searchParams }: PageProps<"/">) {
  const now = new Date();
  const timeZone = await getTimeZone();
  const projectsPromise = listProjects();
  const [
    running,
    projects,
    categories,
    lastUsed,
    nudges,
    today,
    params,
    guideDismissed,
  ] = await Promise.all([
    getRunningSession(),
    projectsPromise,
    listCategories(),
    getLastUsed(),
    getRevisitNudges(projectsPromise, now, timeZone),
    listSessionSpans(startOfLocalDay(now, timeZone)),
    searchParams,
    isGuideDismissed(),
  ]);
  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:py-12">
      <PageHeader title={formatLongDate(now, timeZone)} />
      {/* One column on phones, timer first so Start stays near the top. */}
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-8">
          <TimerScreen
            running={running}
            projects={projects}
            categories={categories}
          >
            {!running && (
              <StartPanel
                projects={activeProjects}
                categories={categories}
                // A nudge links here with the work to restart already chosen.
                defaultProjectId={
                  idIn(activeProjects, params.project) ?? lastUsed?.projectId
                }
                defaultCategoryId={
                  idIn(categories, params.category) ?? lastUsed?.categoryId
                }
              />
            )}
          </TimerScreen>
        </div>
        <aside className="flex flex-col gap-10 lg:sticky lg:top-22">
          {/* No last-used session means none has ever been started. */}
          {!lastUsed && !guideDismissed && (
            <FirstRunGuide hasProject={activeProjects.length > 0} />
          )}
          <TodayPanel
            spans={today}
            categories={categories}
            projects={projects}
            timeZone={timeZone}
          />
          {!running && nudges.length > 0 && (
            <RevisitNudges nudges={nudges} now={now} timeZone={timeZone} />
          )}
        </aside>
      </div>
    </main>
  );
}

function StartPanel({
  projects,
  categories,
  defaultProjectId,
  defaultCategoryId,
}: {
  projects: Project[];
  categories: Category[];
  defaultProjectId: string | undefined;
  defaultCategoryId: string | undefined;
}) {
  if (projects.length === 0) {
    return (
      <EmptyState href="/work" linkText="Add a project">
        Sessions are logged against a project. Add one to start tracking.
      </EmptyState>
    );
  }
  if (categories.length === 0) {
    return (
      <EmptyState href="/work#kinds" linkText="Add a category">
        Sessions need a category. Add one to start tracking.
      </EmptyState>
    );
  }
  return (
    <>
      {/* The clock that starts counting here. Phones drop it so Start stays
          above the tab bar under the date heading. */}
      <div aria-hidden className="hidden text-foreground/25 sm:block">
        <TimerFace elapsedSeconds={0} />
      </div>
      <StartSessionForm
        // Remount so a nudge's choice replaces the chips' earlier defaults.
        key={`${defaultProjectId}:${defaultCategoryId}`}
        projects={projects}
        categories={categories}
        defaultProjectId={defaultProjectId}
        defaultCategoryId={defaultCategoryId}
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

// Query values are user input: accept one only if it names a listed option.
function idIn(
  options: { id: string }[],
  value: string | string[] | undefined,
): string | undefined {
  return options.find((option) => option.id === value)?.id;
}
