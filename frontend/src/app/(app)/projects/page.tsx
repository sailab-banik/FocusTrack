import type { Metadata } from "next";
import { NewProjectForm } from "@/features/projects/new-project-form";
import { ProjectList } from "@/features/projects/project-list";
import { listProjects } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Projects · FocusTrack" };

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Concrete work that sessions are logged against.
        </p>
      </div>
      <NewProjectForm />
      <ProjectList projects={projects} />
    </main>
  );
}
