import type { Project } from "@/features/projects/queries";
import { GoalCard } from "./goal-card";
import type { Goal } from "./queries";

export function GoalList({
  goals,
  projects,
}: {
  goals: Goal[];
  projects: Project[];
}) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No goals yet. Add the long-term outcomes your work should move toward.
      </p>
    );
  }

  const active = goals.filter((g) => !g.archived);
  const archived = goals.filter((g) => g.archived);
  const projectNamesFor = (goalId: string) =>
    projects.filter((p) => p.goalId === goalId).map((p) => p.name);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Active</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All goals are archived.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                projectNames={projectNamesFor(goal.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {archived.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Archived</h2>
          <ul className="flex flex-col gap-3">
            {archived.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                projectNames={projectNamesFor(goal.id)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
