import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { listCategories, type Category } from "@/features/categories/queries";
import { getRevisitNudges } from "@/features/nudges/queries";
import type { RevisitNudge } from "@/features/nudges/revisit";
import { RevisitNudges } from "@/features/nudges/revisit-nudges";
import { listProjects, type Project } from "@/features/projects/queries";
import {
  getLastUsed,
  getRunningSession,
  listSessionSpans,
  type SessionSpan,
} from "@/features/sessions/queries";
import { StartSessionForm } from "@/features/sessions/start-session-form";
import { TimerFace } from "@/features/sessions/timer-face";
import { TimerScreen } from "@/features/sessions/timer-screen";
import { TodayStrip } from "@/features/sessions/today-strip";
import { getTimeZone } from "@/features/timezone/time-zone";
import { startOfLocalDay } from "@/features/timezone/zoned-time";

export default async function TimerPage({ searchParams }: PageProps<"/">) {
  const now = new Date();
  const timeZone = await getTimeZone();
  const projectsPromise = listProjects();
  const [running, projects, categories, lastUsed, nudges, today, params] =
    await Promise.all([
      getRunningSession(),
      projectsPromise,
      listCategories(),
      getLastUsed(),
      getRevisitNudges(projectsPromise, now, timeZone),
      listSessionSpans(startOfLocalDay(now, timeZone)),
      searchParams,
    ]);
  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-8">
      <TimerScreen running={running} projects={projects} categories={categories}>
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
            nudges={nudges}
            today={today}
            now={now}
            timeZone={timeZone}
          />
        )}
      </TimerScreen>
    </main>
  );
}

function StartPanel({
  projects,
  categories,
  defaultProjectId,
  defaultCategoryId,
  nudges,
  today,
  now,
  timeZone,
}: {
  projects: Project[];
  categories: Category[];
  defaultProjectId: string | undefined;
  defaultCategoryId: string | undefined;
  nudges: RevisitNudge[];
  today: SessionSpan[];
  now: Date;
  timeZone: string;
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
      {today.length > 0 ? (
        <TodayStrip spans={today} categories={categories} timeZone={timeZone} />
      ) : (
        // Decorative at rest, so short phones drop it to keep Start in view.
        <div
          aria-hidden
          className="hidden text-foreground/25 sm:block [@media(min-height:760px)]:block"
        >
          <TimerFace elapsedSeconds={0} />
        </div>
      )}
      <StartSessionForm
        // Remount so a nudge's choice replaces the chips' earlier defaults.
        key={`${defaultProjectId}:${defaultCategoryId}`}
        projects={projects}
        categories={categories}
        defaultProjectId={defaultProjectId}
        defaultCategoryId={defaultCategoryId}
      />
      {/* After the form so Start stays within reach on every screen. */}
      {nudges.length > 0 && (
        <RevisitNudges nudges={nudges} now={now} timeZone={timeZone} />
      )}
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
