"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setGoalArchived } from "@/features/goals/actions";
import type { Goal } from "@/features/goals/queries";
import { setProjectArchived } from "@/features/projects/actions";
import type { Project } from "@/features/projects/queries";

export function ArchivedItems({
  goals,
  projects,
}: {
  goals: Goal[];
  projects: Project[];
}) {
  return (
    <details className="border-t pt-6">
      <summary className="w-fit cursor-pointer rounded-md text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        Archived ({goals.length + projects.length})
      </summary>
      <div className="mt-4 flex flex-col gap-6">
        {goals.length > 0 && (
          <ArchivedList
            title="Goals"
            items={goals.map((g) => ({ id: g.id, name: g.title }))}
            restore={(id) => setGoalArchived(id, false)}
          />
        )}
        {projects.length > 0 && (
          <ArchivedList
            title="Projects"
            note="Hidden when starting a session. Past sessions keep their project."
            items={projects}
            restore={(id) => setProjectArchived(id, false)}
          />
        )}
      </div>
    </details>
  );
}

function ArchivedList({
  title,
  note,
  items,
  restore,
}: {
  title: string;
  note?: string;
  items: { id: string; name: string }[];
  restore: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      <ul className="flex flex-col">
        {items.map((item) => (
          <ArchivedRow
            key={item.id}
            name={item.name}
            onRestore={() => restore(item.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function ArchivedRow({
  name,
  onRestore,
}: {
  name: string;
  onRestore: () => Promise<void>;
}) {
  const [restoring, startRestore] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 py-1">
      <span className="truncate text-muted-foreground">{name}</span>
      <Button
        variant="ghost"
        size="sm"
        disabled={restoring}
        onClick={() => startRestore(onRestore)}
      >
        {restoring ? "Restoring…" : "Restore"}
      </Button>
    </li>
  );
}
