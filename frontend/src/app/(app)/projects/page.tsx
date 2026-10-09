import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { listGoals } from "@/features/goals/queries";
import { NewProjectForm } from "@/features/projects/new-project-form";
import { ProjectList } from "@/features/projects/project-list";
import { listProjects } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Projects · FocusTrack" };

export default async function ProjectsPage() {
  const [projects, goals] = await Promise.all([listProjects(), listGoals()]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <PageHeader
        title="Projects"
        description="Concrete work that sessions are logged against. Link each to the goal it serves."
      />
      <NewProjectForm />
      <ProjectList projects={projects} goals={goals} />
    </main>
  );
}
