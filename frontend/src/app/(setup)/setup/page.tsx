import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HOME_PATH } from "@/features/auth/routes";
import { listCategories } from "@/features/categories/queries";
import { SetupFlow } from "@/features/onboarding/setup-flow";
import { listProjects } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Set up · FocusTrack" };

export default async function SetupPage() {
  const [projects, categories] = await Promise.all([
    listProjects(),
    listCategories(),
  ]);
  if (projects.length > 0) redirect(HOME_PATH);

  return <SetupFlow categories={categories} />;
}
