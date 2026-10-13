import { cn } from "cn";
import { totalSeconds, type KindSeconds } from "./allocation";

/**
 * Worked time as a bar sized against `maxSeconds`, execution first. The
 * caller states the time in text; the bar only lets rows be compared.
 */
export function TimeBar({
  time,
  maxSeconds,
  className,
}: {
  time: KindSeconds;
  maxSeconds: number;
  className?: string;
}) {
  const total = totalSeconds(time);

  return (
    <div aria-hidden className={cn("flex h-1.5 rounded-full bg-muted", className)}>
      {total > 0 && (
        <div
          className="flex min-w-1.5 gap-px overflow-hidden rounded-full"
          style={{ width: `${(total / maxSeconds) * 100}%` }}
        >
          {time.execution > 0 && (
            <span
              data-kind="execution"
              className="bg-kind"
              style={{ flexGrow: time.execution }}
            />
          )}
          {time.preparation > 0 && (
            <span
              data-kind="preparation"
              className="bg-kind"
              style={{ flexGrow: time.preparation }}
            />
          )}
        </div>
      )}
    </div>
  );
}
