"use client";

import { useState } from "react";
import { cn } from "cn";

const SECTIONS = [
  { id: "profile", label: "Profile", dot: "bg-peach" },
  { id: "categories", label: "Categories", dot: "bg-tangerine" },
  { id: "reports", label: "Reports and AI", dot: "bg-periwinkle" },
  { id: "time", label: "Time and days", dot: "bg-butter" },
  { id: "app", label: "App", dot: "bg-mint" },
  { id: "account", label: "Account", dot: "bg-lilac" },
];

export function SectionNav() {
  const [current, setCurrent] = useState("profile");

  return (
    <nav
      aria-label="Settings sections"
      className="sticky top-6 hidden w-[200px] shrink-0 flex-col gap-0.5 lg:flex"
    >
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={current === section.id ? "true" : undefined}
          onClick={() => setCurrent(section.id)}
          className={cn(
            "flex h-10 items-center gap-2.5 rounded-xl px-3.5 text-sm transition-colors",
            current === section.id
              ? "bg-paper font-semibold text-ink"
              : "font-medium text-ink-soft hover:bg-wash",
          )}
        >
          <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-[3px]", section.dot)}
          />
          {section.label}
        </a>
      ))}
    </nav>
  );
}
