import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/features/auth/current-user";
import { SETUP_PATH } from "@/features/auth/routes";
import { listCategories, type Category } from "@/features/categories/queries";
import { SETUP_SKIPPED_COOKIE } from "@/features/onboarding/setup-skip";
import { getRevisitNudges } from "@/features/nudges/queries";
import { RevisitNudges } from "@/features/nudges/revisit-nudges";
import { listProjects, type Project } from "@/features/projects/queries";
import { ReportReadyCard } from "@/features/review/report-ready-card";
import { firstName } from "@/features/settings/name";
import { sessionSeconds } from "@/features/sessions/duration";
import { dayLine, greeting, skyPhase } from "@/features/sessions/greeting";
import { executionSeconds } from "@/features/sessions/history";
import { LocalClock } from "@/features/sessions/local-clock";
import { DaySky } from "@/features/sessions/day-sky";
import {
  getLastUsed,
  getRunningSession,
  listSessionSpans,
} from "@/features/sessions/queries";
import { staleOutcome } from "@/features/sessions/stale-session";
import { StartSessionForm } from "@/features/sessions/start-session-form";
import { TimerScreen } from "@/features/sessions/timer-screen";
import { TodayPanel, TrackedToday } from "@/features/sessions/today-panel";
import { getTimeZone } from "@/features/timezone/time-zone";
import {
  formatLongDate,
  minutesIntoDay,
  startOfLocalDay,
} from "@/features/timezone/zoned-time";

export default async function TodayPage({ searchParams }: PageProps<"/">) {
  const now = new Date();
  const [timeZone, user] = await Promise.all([getTimeZone(), requireUser()]);
  const projectsPromise = listProjects();
  const [running, projects, categories, lastUsed, nudges, today, params, store] =
    await Promise.all([
      getRunningSession(),
      projectsPromise,
      listCategories(),
      getLastUsed(),
      getRevisitNudges(projectsPromise, now, timeZone),
      listSessionSpans(startOfLocalDay(now, timeZone)),
      searchParams,
      cookies(),
    ]);
  // A session left on is closed by the timer screen, so it is not shown as running.
  const stale = running && staleOutcome(running, now) ? running : null;
  const live = stale ? null : running;
  // Every new account lands in setup first, unless they chose to skip it.
  if (projects.length === 0 && !store.has(SETUP_SKIPPED_COOKIE)) {
    redirect(SETUP_PATH);
  }
  const activeProjects = projects.filter((p) => !p.archived);
  const minutes = minutesIntoDay(now, timeZone);
  const brightSky = skyPhase(minutes) === "morning";
  const total = today.reduce((sum, span) => sum + sessionSeconds(span), 0);
  const execution = executionSeconds(
    today,
    new Map(categories.map((c) => [c.id, c])),
  );

  return (
    // The sky runs up behind the phone header.
    <main className="-mt-16 flex flex-col md:mt-0 md:px-2 md:pt-[18px] md:pr-7 md:pb-12">
      <div className="flex w-full max-w-[1160px] flex-col">
        <DaySky minutesIntoDay={minutes}>
          <span
            className={`text-[13px] font-medium md:text-sm ${brightSky ? "text-ink-soft" : "text-white/80"}`}
          >
            {formatLongDate(now, timeZone)}
          </span>
          <h1 className="font-serif text-[34px] leading-10 md:text-[44px] md:leading-[50px] md:tracking-[-0.01em]">
            {greeting(minutes, firstName(user.name))}
          </h1>
          <p
            className={`hidden text-base md:block ${brightSky ? "text-[#3e3a5e]" : "text-white/90"}`}
          >
            {dayLine(execution, total - execution)}
          </p>
          <LocalClock
            initialNow={now.toISOString()}
            timeZone={timeZone}
            className={`absolute right-5 bottom-[66px] text-[13px] font-medium md:top-8 md:right-9 md:bottom-auto md:text-sm ${brightSky ? "text-ink-soft" : "text-white/75"}`}
          />
        </DaySky>

        <div className="relative -mt-[54px] grid items-start gap-5 px-4 md:-mt-11 md:gap-6 md:px-5 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
          <div className="flex min-w-0 flex-col gap-5 md:gap-6">
            <section
              aria-label="Timer"
              className="rounded-[26px] bg-paper p-5 shadow-[0_1px_2px_rgb(31_27_61/.05),0_16px_40px_rgb(46_42_120/.12)] md:rounded-3xl md:p-7"
            >
              <TimerScreen
                running={live}
                staleSessionId={stale?.id ?? null}
                projects={projects}
                categories={categories}
                timeZone={timeZone}
              >
                {!live && (
                  <StartPanel
                    projects={activeProjects}
                    categories={categories}
                    // A nudge links here with the work to restart already chosen.
                    defaultProjectId={
                      idIn(activeProjects, params.project) ??
                      idIn(activeProjects, lastUsed?.projectId)
                    }
                    defaultCategoryId={
                      idIn(categories, params.category) ?? lastUsed?.categoryId
                    }
                  />
                )}
              </TimerScreen>
            </section>
            <TodayPanel
              spans={today}
              categories={categories}
              projects={projects}
              timeZone={timeZone}
              now={now}
            />
          </div>
          <aside className="flex min-w-0 flex-col gap-5">
            <TrackedToday spans={today} categories={categories} />
            <Suspense>
              <ReportReadyCard />
            </Suspense>
            {!live && nudges.length > 0 && (
              <RevisitNudges nudges={nudges} now={now} timeZone={timeZone} />
            )}
          </aside>
        </div>
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
      <EmptyState href="/projects" linkText="Add a project">
        Sessions are logged against a project. Add one to start tracking.
      </EmptyState>
    );
  }
  if (categories.length === 0) {
    return (
      <EmptyState href="/settings#categories" linkText="Add a category">
        Sessions need a category. Add one to start tracking.
      </EmptyState>
    );
  }
  return (
    <StartSessionForm
      // Remount so a nudge's choice replaces the earlier defaults.
      key={`${defaultProjectId}:${defaultCategoryId}`}
      projects={projects}
      categories={categories}
      defaultProjectId={defaultProjectId}
      defaultCategoryId={defaultCategoryId}
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
    <div className="flex flex-col items-start gap-4">
      <p className="font-serif text-xl">{children}</p>
      <Link
        href={href}
        className={buttonVariants({ size: "lg", className: "h-11 px-4" })}
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
