import type { Metadata } from "next";
import { GoalList } from "@/features/goals/goal-list";
import { NewGoalForm } from "@/features/goals/new-goal-form";
import { listGoals } from "@/features/goals/queries";
import { listProjects } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Goals · FocusTrack" };

export default async function GoalsPage() {
  const [goals, projects] = await Promise.all([listGoals(), listProjects()]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground">
          Long-term outcomes. Projects link to the goal they serve.
        </p>
      </div>
      <GoalList goals={goals} projects={projects} />
      <section className="flex flex-col gap-3 border-t pt-6">
        <h2 className="text-sm font-medium">New goal</h2>
        <NewGoalForm />
      </section>
    </main>
  );
}
