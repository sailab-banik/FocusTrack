"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default function AppError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-4 py-8 sm:py-12">
      <PageHeader
        title="Something went wrong"
        description="This page could not load. Your data has not been changed."
      />
      <Button
        variant="outline"
        size="lg"
        className="h-10 px-4"
        onClick={() => retry()}
      >
        Try again
      </Button>
    </main>
  );
}
