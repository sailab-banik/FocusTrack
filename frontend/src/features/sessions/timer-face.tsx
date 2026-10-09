import { cn } from "cn";
import { formatClock } from "./duration";

const MINUTES = Array.from({ length: 60 }, (_, index) => index + 1);
const QUARTERS = [15, 30, 45, 60];

// Minutes carry the weight and seconds stay small: the clock should show
// that time is passing without asking to be watched.
export function TimerFace({ elapsedSeconds }: { elapsedSeconds: number }) {
  const clock = formatClock(elapsedSeconds);
  // formatClock always ends in ":SS".
  const minutes = clock.slice(0, -3);
  const seconds = clock.slice(-3);

  return (
    <div className="flex flex-col gap-5">
      {/* Server and client clocks differ by the render delay. */}
      <p
        role="timer"
        className="flex items-baseline text-[clamp(6rem,34vw,11rem)] leading-[0.8] font-bold tracking-tight tabular-nums font-stretch-[68%]"
      >
        <span suppressHydrationWarning>{minutes}</span>
        <span
          className="text-[0.38em] font-semibold opacity-60"
          suppressHydrationWarning
        >
          {seconds}
        </span>
      </p>
      <MinuteRail secondsIntoHour={elapsedSeconds % 3600} />
    </div>
  );
}

// A ruler for the current hour. The fill is one element behind a row of
// static tick windows, so a server/client clock mismatch corrects itself on
// the next second instead of leaving a stale tick.
function MinuteRail({ secondsIntoHour }: { secondsIntoHour: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      <div className="relative h-8 bg-border">
        <div
          className="absolute inset-y-0 left-0 bg-kind transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
          style={{ width: `${secondsIntoHour / 36}%` }}
          suppressHydrationWarning
        />
        <div className="absolute inset-0 flex">
          {MINUTES.map((minute) => (
            <span
              key={minute}
              className={cn(
                "flex-1 border-background not-last:border-r-2",
                minute % 5 !== 0 && "border-t-12",
              )}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 text-right text-xs text-muted-foreground tabular-nums">
        {QUARTERS.map((quarter) => (
          <span key={quarter}>{quarter}</span>
        ))}
      </div>
    </div>
  );
}
