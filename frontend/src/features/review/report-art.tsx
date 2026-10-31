import type { PeriodKind } from "./periods";

const CLOUD =
  "M10 22 a9 9 0 0 1 4-17 a12 12 0 0 1 22 2 a9 9 0 0 1 16 4 a7 7 0 0 1 8 11 Z";

const WEEK_BARS = [
  { x: 140, y: 40, height: 70 },
  { x: 206, y: 28, height: 82 },
  { x: 272, y: 56, height: 54 },
  { x: 338, y: 18, height: 92 },
  { x: 404, y: 44, height: 66 },
  { x: 470, y: 46, height: 64 },
  { x: 536, y: 96, height: 14 },
];

const NIGHT_STARS = [
  { left: "18%", top: 34, size: 3, delay: "0s" },
  { left: "34%", top: 70, size: 2, delay: "0.7s" },
  { left: "52%", top: 26, size: 3, delay: "1.3s" },
  { left: "88%", top: 82, size: 2, delay: "0.3s" },
];

/** Morning for a day, a week of bars for a week, the night sky for a month. */
export function ReportArt({ kind }: { kind: PeriodKind }) {
  if (kind === "day") {
    return (
      <div
        aria-hidden
        className="relative h-[120px] shrink-0 overflow-hidden bg-[linear-gradient(180deg,#ffe3cf,#f8dceb_60%,#e4deff)] md:h-[150px]"
      >
        <div className="absolute top-11 left-[64%] size-[54px] rounded-full bg-[#ff9a5a]" />
        <svg
          viewBox="0 0 70 26"
          className="absolute top-[30px] left-[22%] h-[30px] w-20 fill-white opacity-90"
          style={{ animation: "ft-drift 16s ease-in-out infinite alternate" }}
        >
          <path d={CLOUD} />
        </svg>
        <svg
          viewBox="0 0 800 60"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-14 w-full"
        >
          <path
            d="M0 34 C160 10 300 30 460 24 C620 18 700 8 800 20 V60 H0 Z"
            fill="#C4BAF0"
          />
        </svg>
      </div>
    );
  }

  if (kind === "week") {
    return (
      <div
        aria-hidden
        className="relative h-[120px] shrink-0 overflow-hidden bg-lilac md:h-[150px]"
      >
        <svg
          viewBox="0 0 700 150"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
        >
          <g fill="#FFFFFF" opacity=".55">
            {WEEK_BARS.map((bar) => (
              <rect
                key={bar.x}
                x={bar.x}
                y={bar.y}
                width="54"
                height={bar.height}
                rx={bar.height < 20 ? 7 : 14}
              />
            ))}
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="relative h-[120px] shrink-0 overflow-hidden bg-[linear-gradient(180deg,#2e2a78,#4b4fc9)] md:h-[150px]"
    >
      <svg
        viewBox="0 0 700 150"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <circle cx="520" cy="58" r="28" fill="#FFEFB8" />
        <circle cx="534" cy="49" r="26" fill="#383399" />
        <path
          d="M0 120 C160 96 320 116 460 108 C580 100 640 96 700 104 V150 H0 Z"
          fill="#232062"
        />
      </svg>
      {NIGHT_STARS.map((star) => (
        <span
          key={star.left}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animation: `ft-twinkle 3.6s ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
