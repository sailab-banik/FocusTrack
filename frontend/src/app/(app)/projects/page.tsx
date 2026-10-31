import type { Metadata } from "next";
import { KindMark } from "@/features/categories/kind-mark";
import { listCategories } from "@/features/categories/queries";
import { ProjectBoard } from "@/features/projects/project-board";
import { ProjectCard } from "@/features/projects/project-card";
import { listProjects } from "@/features/projects/queries";
import { formatDuration } from "@/features/sessions/duration";
import { listSessionSpans } from "@/features/sessions/queries";
import { getTimeZone } from "@/features/timezone/time-zone";
import {
  allocate,
  goalAlignment,
  NO_TIME,
  percent,
  WINDOW_DAYS,
} from "@/features/work/allocation";
import { ArchivedItems } from "@/features/work/archived-items";
import {
  lastSessionLine,
  summarizeProjects,
} from "@/features/work/project-summary";

export const metadata: Metadata = { title: "Projects · FocusTrack" };

const DAY_MS = 86_400_000;

export default async function ProjectsPage() {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * DAY_MS);
  const [projects, categories, spans, timeZone] = await Promise.all([
    listProjects(),
    listCategories(),
    listSessionSpans(since),
    getTimeZone(),
  ]);
  const { byProject } = allocate(spans, categories);
  const summaries = summarizeProjects(spans, now, timeZone);
  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);
  const { trackedSeconds, servingSeconds } = goalAlignment(byProject, projects);

  return (
    <main className="flex w-full max-w-[1160px] flex-col gap-6 px-4 pt-1 pb-8 md:pt-[26px] md:pr-7 md:pb-14 md:pl-2">
      <ProjectBoard
        description={
          trackedSeconds === 0
            ? "No finished sessions in the last 4 weeks."
            : `${formatDuration(trackedSeconds)} in the last 4 weeks. ${percent(servingSeconds, trackedSeconds)}% of it went to projects with a goal.`
        }
        legend={
          trackedSeconds > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
              <span className="flex items-center gap-1.5">
                <KindMark kind="execution" className="size-[9px]" />
                Execution
              </span>
              <span className="flex items-center gap-1.5">
                <KindMark kind="preparation" className="size-[9px]" />
                Preparation
              </span>
              <span className="text-ink-muted">
                Bars show the last 4 weeks.
              </span>
            </div>
          )
        }
      >
        {activeProjects.map((project) => {
          const summary = summaries.get(project.id);
          return (
            <ProjectCard
              key={project.id}
              project={project}
              time={byProject.get(project.id) ?? NO_TIME}
              weekSeconds={summary?.weekSeconds ?? 0}
              lastLine={lastSessionLine(summary?.lastDayKey, now, timeZone)}
              lastComment={summary?.lastComment ?? null}
            />
          );
        })}
      </ProjectBoard>

      {archivedProjects.length > 0 && (
        <ArchivedItems projects={archivedProjects} />
      )}
    </main>
  );
}
