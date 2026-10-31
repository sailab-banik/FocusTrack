import { cn } from "cn";
import { formatClock } from "./duration";

export function TimerFace({
  elapsedSeconds,
  paused,
  children,
}: {
  elapsedSeconds: number;
  paused: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Server and client clocks differ by the render delay. */}
        <p
          role="timer"
          suppressHydrationWarning
          className={cn(
            "font-serif text-[clamp(3.5rem,20vw,5rem)] leading-none tracking-[-0.03em] transition-colors md:text-[104px]",
            paused && "text-[#8e8ba6]",
          )}
        >
          {formatClock(elapsedSeconds)}
        </p>
        {!paused && (
          <span
            aria-hidden
            className="ft-pulse size-3 rounded-full bg-tangerine shadow-[0_0_0_6px_var(--color-tangerine-soft)]"
          />
        )}
        {children}
      </div>
      <HourBar secondsIntoHour={elapsedSeconds % 3600} />
    </div>
  );
}

function HourBar({ secondsIntoHour }: { secondsIntoHour: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <div className="h-2.5 rounded-full bg-wash md:h-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#f6b37e] to-tangerine transition-[width] duration-1000 ease-linear"
          style={{ width: `${secondsIntoHour / 36}%` }}
          suppressHydrationWarning
        />
      </div>
      <div className="hidden justify-between text-xs text-ink-muted md:flex">
        <span>This hour</span>
        <span>60 min</span>
      </div>
    </div>
  );
}
