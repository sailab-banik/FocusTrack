import { KindMark } from "@/features/categories/kind-mark";
import { formatDuration } from "./duration";

export function KindTotals({
  execution,
  preparation,
}: {
  execution: number;
  preparation: number;
}) {
  const parts = [
    { kind: "execution", label: "Execution", seconds: execution },
    { kind: "preparation", label: "Preparation", seconds: preparation },
  ] as const;

  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {parts.map((part) => (
        <div key={part.kind} className="flex items-center gap-1.5">
          <KindMark kind={part.kind} />
          <dt className="text-muted-foreground">{part.label}</dt>
          <dd className="font-medium tabular-nums">
            {formatDuration(part.seconds)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
