import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HOME_PATH } from "@/features/auth/routes";
import { listCategories } from "@/features/categories/queries";
import { ReadyCard } from "@/features/onboarding/ready-card";
import { listProjects } from "@/features/projects/queries";
import { getLastUsed } from "@/features/sessions/queries";

export const metadata: Metadata = { title: "Your day starts now · FocusTrack" };

export default async function SetupReadyPage() {
  const [projects, categories, lastUsed] = await Promise.all([
    listProjects(),
    listCategories(),
    getLastUsed(),
  ]);
  const project = projects.find((p) => !p.archived);
  const category =
    categories.find((c) => c.kind === "execution") ?? categories[0];
  // Reached again after the first session, or with nothing to start: home
  // handles both.
  if (lastUsed || !project || !category) redirect(HOME_PATH);

  return (
    <div className="ft-in flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-[32px] leading-[38px] lg:text-[44px] lg:leading-[50px]">
          Your day starts now.
        </h1>
        <p className="text-[15px] leading-[22px] text-ink-soft lg:text-lg">
          Your first session is ready. Nothing counts until you press Start.
        </p>
      </div>
      <ReadyCard project={project} category={category} />
    </div>
  );
}
