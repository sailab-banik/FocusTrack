import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";

export default function WorkLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-8 sm:py-12">
      <PageHeader title="Work" />
      <ListSkeleton label="Loading goals and projects" />
    </main>
  );
}
