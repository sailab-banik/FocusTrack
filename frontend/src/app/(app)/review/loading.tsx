import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";

export default function ReviewLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-8 sm:py-12">
      <PageHeader title="Review" />
      <ListSkeleton label="Loading your weeks" />
    </main>
  );
}
