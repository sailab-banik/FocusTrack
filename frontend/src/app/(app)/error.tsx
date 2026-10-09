"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-3 p-4">
      <h1 className="text-xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground">
        This page could not load. Your data has not been changed.
      </p>
      <Button variant="outline" onClick={() => retry()}>
        Try again
      </Button>
    </main>
  );
}
