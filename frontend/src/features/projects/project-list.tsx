import type { Goal } from "@/features/goals/queries";
import { ProjectRow } from "./project-row";
import type { Project } from "./queries";

export function ProjectList({
  projects,
  goals,
}: {
  projects: Project[];
  goals: Goal[];
}) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No projects yet. Add the concrete things you are working on, such as an
        app, a course, or a song.
      </p>
    );
  }

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Active</h2>
        {active.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            All projects are archived.
          </p>
        ) : (
          <ul className="divide-y">
            {active.map((project) => (
              <ProjectRow key={project.id} project={project} goals={goals} />
            ))}
          </ul>
        )}
      </section>

      {archived.length > 0 && (
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Archived</h2>
          <p className="text-sm text-muted-foreground">
            Hidden when starting a session. Past sessions keep their project.
          </p>
          <ul className="divide-y">
            {archived.map((project) => (
              <ProjectRow key={project.id} project={project} goals={goals} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
