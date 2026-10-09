import { cn } from "cn";
import type { CategoryKind } from "./category-input";

// Shape repeats what the color says, so the kind never depends on color
// alone: a square for execution, a dot for preparation.
export function KindMark({
  kind,
  className,
}: {
  kind: CategoryKind;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      data-kind={kind}
      className={cn(
        "inline-block size-2.5 shrink-0 bg-kind",
        kind === "execution" ? "rounded-[3px]" : "rounded-full",
        className,
      )}
    />
  );
}
