import { cn } from "cn";
import { MINUTES_PER_DAY, type DayBlock } from "./history";

function percentOfDay(minutes: number): string {
  return `${(minutes / MINUTES_PER_DAY) * 100}%`;
}

function clockTime(minutes: number): string {
  const whole = Math.floor(minutes);
  const hours = Math.floor(whole / 60) % 24;
  return `${hours.toString().padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`;
}

/**
 * The local day, midnight to midnight, as a short track sized to sit in a
 * heading row, each session where it happened. One long capsule reads as
 * deep work; a scatter reads as fragmented. The faint tick is noon. The
 * session list beside it carries the same times as text.
 */
export function DayStrip({
  blocks,
  className,
}: {
  blocks: DayBlock[];
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative h-2 w-24 shrink-0 rounded-full bg-muted sm:w-36",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-1/2 w-px bg-background" />
      {blocks.map((block, index) => (
        <span
          key={index}
          data-kind={block.kind}
          title={`${clockTime(block.startMinute)}–${clockTime(block.endMinute)}`}
          className="absolute inset-y-0 min-w-[3px] rounded-full bg-kind"
          style={{
            left: percentOfDay(block.startMinute),
            width: percentOfDay(block.endMinute - block.startMinute),
          }}
        />
      ))}
    </div>
  );
}
