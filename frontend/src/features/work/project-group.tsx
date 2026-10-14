import { cn } from "cn";
import type { Goal } from "@/features/goals/queries";
import { NewProjectForm } from "@/features/projects/new-project-form";
import { ProjectRow } from "@/features/projects/project-row";
import type { Project } from "@/features/projects/queries";
import { NO_TIME, type KindSeconds } from "./allocation";

/**
 * A goal's projects, or the projects serving none. The rule down the left
 * side marks projects that belong to the goal above them. Projects serving
 * none keep the rule's space, invisibly, so every bar track is the same
 * width and bars share one scale across groups.
 */
export function ProjectGroup({
  projects,
  goalId,
  goals,
  linkable,
  timeByProject,
  maxSeconds,
}: {
  projects: Project[];
  goalId: string | null;
  goals: Goal[];
  /** Active projects outside this group that could be linked to its goal. */
  linkable: Project[];
  timeByProject: Map<string, KindSeconds>;
  maxSeconds: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col border-l-2 pl-4 sm:pl-5",
        !goalId && "border-transparent",
      )}
    >
      {projects.length > 0 && (
        <ul className="flex flex-col">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              goals={goals}
              time={timeByProject.get(project.id) ?? NO_TIME}
              maxSeconds={maxSeconds}
            />
          ))}
        </ul>
      )}
      <NewProjectForm goalId={goalId} goals={goals} linkable={linkable} />
    </div>
  );
}
