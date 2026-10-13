"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Keeps add forms out of the way until asked for; `close` lets the form shut
// itself once it saves.
export function AddToggle({
  label,
  children,
}: {
  label: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (open) return children(() => setOpen(false));

  return (
    <Button
      variant="ghost"
      size="lg"
      className="-ml-2.5 self-start text-muted-foreground"
      onClick={() => setOpen(true)}
    >
      <Plus />
      {label}
    </Button>
  );
}
