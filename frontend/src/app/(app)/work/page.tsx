import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { KindMark } from "@/features/categories/kind-mark";
import { KindsOfWork } from "@/features/categories/kinds-of-work";
import { listCategories } from "@/features/categories/queries";
import { GoalHeader } from "@/features/goals/goal-header";
import { NewGoalForm } from "@/features/goals/new-goal-form";
import { listGoals } from "@/features/goals/queries";
import { listProjects, type Project } from "@/features/projects/queries";
import { formatDuration } from "@/features/sessions/duration";
import { listSessionSpans } from "@/features/sessions/queries";
import {
  allocate,
  goalAlignment,
  NO_TIME,
  percent,
  sumTime,
  totalSeconds,
  WINDOW_DAYS,
  type KindSeconds,
} from "@/features/work/allocation";
import { ArchivedItems } from "@/features/work/archived-items";
import { ProjectGroup } from "@/features/work/project-group";

export const metadata: Metadata = { title: "Work · FocusTrack" };

const DAY_MS = 86_400_000;

export default async function WorkPage() {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * DAY_MS);
  const [goals, projects, categories, spans] = await Promise.all([
    listGoals(),
    listProjects(),
    listCategories(),
    listSessionSpans(since),
  ]);
  const { byProject, byCategory } = allocate(spans, categories);

  const activeGoals = goals.filter((g) => !g.archived);
  const activeGoalIds = new Set(activeGoals.map((g) => g.id));
  const activeProjects = projects.filter((p) => !p.archived);
  const unlinked = activeProjects.filter(
    (p) => p.goalId === null || !activeGoalIds.has(p.goalId),
  );
  const timeOf = (project: Project) => byProject.get(project.id) ?? NO_TIME;
  // Bars share one scale so projects compare across goals.
  const maxSeconds = Math.max(
    0,
    ...activeProjects.map((p) => totalSeconds(timeOf(p))),
  );
  const { trackedSeconds, servingSeconds } = goalAlignment(
    byProject,
    projects,
    activeGoalIds,
  );
  const groupProps = { goals, timeByProject: byProject, maxSeconds };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Work"
          description={
            trackedSeconds === 0
              ? "No finished sessions in the last 4 weeks."
              : `${formatDuration(trackedSeconds)} tracked in the last 4 weeks. ${percent(servingSeconds, trackedSeconds)}% of it went to projects that serve a goal.`
          }
        />
        {trackedSeconds > 0 && <Legend />}
      </div>

      <div className="flex flex-col gap-14">
        {activeGoals.length === 0 && (
          <p className="max-w-prose text-muted-foreground">
            Goals are the long-term outcomes your work should move toward. Add
            one, then add the projects that serve it.
          </p>
        )}
        {activeGoals.map((goal) => {
          const goalProjects = activeProjects.filter(
            (p) => p.goalId === goal.id,
          );
          return (
            <section key={goal.id} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <GoalHeader goal={goal} />
                <GoalTime time={sumTime(goalProjects.map(timeOf))} />
              </div>
              <ProjectGroup
                projects={goalProjects}
                goalId={goal.id}
                {...groupProps}
              />
            </section>
          );
        })}
        <NewGoalForm />
      </div>

      {(unlinked.length > 0 || activeGoals.length === 0) && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold tracking-tight">
              {activeGoals.length === 0 ? "Projects" : "Not serving a goal"}
            </h2>
            {activeGoals.length > 0 && (
              <p className="max-w-prose text-muted-foreground">
                Time here does not move any goal. Edit a project to link it to
                the goal it serves.
              </p>
            )}
          </div>
          <ProjectGroup projects={unlinked} goalId={null} {...groupProps} />
        </section>
      )}

      <div className="border-t pt-10">
        <KindsOfWork categories={categories} secondsByCategory={byCategory} />
      </div>

      {goals.length > activeGoals.length ||
      projects.length > activeProjects.length ? (
        <ArchivedItems
          goals={goals.filter((g) => g.archived)}
          projects={projects.filter((p) => p.archived)}
        />
      ) : null}
    </main>
  );
}

function GoalTime({ time }: { time: KindSeconds }) {
  const total = totalSeconds(time);
  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No time in the last 4 weeks
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground tabular-nums">
        {formatDuration(total)}
      </span>{" "}
      in 4 weeks, {percent(time.execution, total)}% execution
    </p>
  );
}

function Legend() {
  return (
    <ul
      aria-label="Bar colors"
      className="flex gap-5 text-sm text-muted-foreground"
    >
      <li className="flex items-center gap-1.5">
        <KindMark kind="execution" />
        Execution
      </li>
      <li className="flex items-center gap-1.5">
        <KindMark kind="preparation" />
        Preparation
      </li>
    </ul>
  );
}
