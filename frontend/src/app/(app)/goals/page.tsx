import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { GoalList } from "@/features/goals/goal-list";
import { NewGoalForm } from "@/features/goals/new-goal-form";
import { listGoals } from "@/features/goals/queries";
import { listProjects } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Goals · FocusTrack" };

export default async function GoalsPage() {
  const [goals, projects] = await Promise.all([listGoals(), listProjects()]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <PageHeader
        title="Goals"
        description="Long-term outcomes. Projects link to the goal they serve."
      />
      <GoalList goals={goals} projects={projects} />
      <section className="flex flex-col gap-4 border-t pt-8">
        <h2 className="text-lg font-semibold tracking-tight">New goal</h2>
        <NewGoalForm />
      </section>
    </main>
  );
}
