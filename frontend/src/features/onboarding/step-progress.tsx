import { cn } from "cn";

export function StepProgress({
  label,
  total,
  current,
  animate,
  className,
}: {
  label: string;
  total: number;
  current: number;
  animate: boolean;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className={cn("flex gap-1.5", className)}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className="relative h-1 flex-1 overflow-hidden rounded-sm bg-ink/14"
        >
          {index <= current && (
            <span
              className={cn(
                "absolute inset-0 rounded-sm bg-indigo",
                animate && index === current && "ft-seg",
              )}
            />
          )}
        </span>
      ))}
    </div>
  );
}
