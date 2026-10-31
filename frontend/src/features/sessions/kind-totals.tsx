import { cn } from "cn";
import { KindMark } from "@/features/categories/kind-mark";
import { formatDuration } from "./duration";

export function KindTotals({
  execution,
  preparation,
  stacked = false,
}: {
  execution: number;
  preparation: number;
  stacked?: boolean;
}) {
  const parts = [
    { kind: "execution", label: "Execution", seconds: execution },
    { kind: "preparation", label: "Preparation", seconds: preparation },
  ] as const;

  return (
    <dl
      className={cn(
        "flex text-[13px]",
        stacked ? "flex-col gap-2 text-sm" : "flex-wrap justify-between gap-x-5 gap-y-1",
      )}
    >
      {parts.map((part) => (
        <div
          key={part.kind}
          className={cn(
            "flex items-center gap-1.5",
            stacked && "justify-between",
          )}
        >
          <dt className="flex items-center gap-2 text-ink-soft">
            <KindMark kind={part.kind} className="size-2" />
            {part.label}
          </dt>
          <dd className={cn(stacked ? "font-semibold" : "text-ink-soft")}>
            {formatDuration(part.seconds)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
