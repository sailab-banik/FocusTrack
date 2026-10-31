import { type DayBlock, timelineSpan } from "./history";

const LABELS = [
  { at: "0%", text: "6 am", place: "" },
  { at: "25%", text: "10", place: "-translate-x-1/2" },
  { at: "50%", text: "2 pm", place: "-translate-x-1/2" },
  { at: "75%", text: "6", place: "-translate-x-1/2" },
];

/** The working day, 6 am to 10 pm, with each session where it happened. */
export function DayTimeline({ blocks }: { blocks: DayBlock[] }) {
  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      <div className="relative h-[34px] overflow-hidden rounded-[10px] bg-mist">
        {blocks.flatMap((block, index) => {
          const span = timelineSpan(block);
          if (!span) return [];
          return (
            <span
              key={index}
              data-kind={block.kind}
              className="absolute top-1.5 h-[22px] min-w-1 rounded-md bg-kind"
              style={{ left: `${span.left}%`, width: `${span.width}%` }}
            />
          );
        })}
      </div>
      <div className="relative h-4 text-[11px] text-ink-muted">
        {LABELS.map((label) => (
          <span
            key={label.at}
            className={`absolute ${label.place}`}
            style={{ left: label.at }}
          >
            {label.text}
          </span>
        ))}
        <span className="absolute right-0">10 pm</span>
      </div>
    </div>
  );
}
