import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";

export default function HistoryLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <PageHeader title="History" />
      <ListSkeleton label="Loading sessions" />
    </main>
  );
}
