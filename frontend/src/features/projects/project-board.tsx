"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { NewProjectCard } from "./new-project-card";

/** The page header and the card grid share "New project". */
export function ProjectBoard({
  description,
  legend,
  children,
}: {
  description: string;
  legend: React.ReactNode;
  children: React.ReactNode;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader
        title="Projects"
        description={description}
        action={
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="New project"
            className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-[14px] bg-indigo px-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgb(46_42_120/.22)] sm:px-[18px]"
          >
            <Plus aria-hidden className="size-3.5" />
            <span className="hidden sm:inline">New project</span>
          </button>
        }
      />
      {legend}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-5">
        {children}
        <NewProjectCard open={adding} onOpenChange={setAdding} />
      </div>
    </>
  );
}
