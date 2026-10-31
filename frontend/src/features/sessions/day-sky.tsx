import { cn } from "cn";
import { skyPhase, sunPosition, type SkyPhase } from "./greeting";

const CLOUD_PATH =
  "M10 22 a9 9 0 0 1 4-17 a12 12 0 0 1 22 2 a9 9 0 0 1 16 4 a7 7 0 0 1 8 11 Z";

const SKIES: Record<
  SkyPhase,
  { sky: string; glow: string; sun: string; hillBack: string; hillFront: string }
> = {
  morning: {
    sky: "bg-[linear-gradient(180deg,#ffe3cf_0%,#f8dceb_55%,#e4deff_100%)] text-ink",
    glow: "#FFB27D",
    sun: "#FF9A5A",
    hillBack: "#D9D1F6",
    hillFront: "#C4BAF0",
  },
  afternoon: {
    sky: "bg-[linear-gradient(180deg,#2e2a78_0%,#6b4fa8_38%,#d98da8_70%,#ffc9a8_100%)] text-white",
    glow: "#FF8A6B",
    sun: "#FFB27D",
    hillBack: "#7C5FB0",
    hillFront: "#5A4796",
  },
  evening: {
    sky: "bg-[linear-gradient(180deg,#2e2a78_0%,#4b4fc9_100%)] text-white",
    glow: "#FFEFB8",
    sun: "#FFEFB8",
    hillBack: "#3E3A9E",
    hillFront: "#332F8A",
  },
};

const STARS = [
  { left: "42%", top: "14%", size: 3, delay: "0s" },
  { left: "58%", top: "30%", size: 2, delay: "0.7s" },
  { left: "68%", top: "12%", size: 2, delay: "1.8s" },
  { left: "81%", top: "38%", size: 3, delay: "1.2s" },
  { left: "74%", top: "24%", size: 2, delay: "0.3s" },
];

/**
 * The Today header, by local time: morning sky, then the sunset through the
 * afternoon, then night with a crescent moon. Phones keep the sun or moon fixed
 * to the right, because the greeting fills the rest of the narrow sky.
 */
export function DaySky({
  minutesIntoDay,
  children,
}: {
  minutesIntoDay: number;
  children: React.ReactNode;
}) {
  const phase = skyPhase(minutesIntoDay);
  const sky = SKIES[phase];
  const sun = sunPosition(minutesIntoDay);
  const evening = phase === "evening";
  const place = {
    "--sun-x": evening ? "80%" : `${sun.x}%`,
    "--sun-y": evening ? "32%" : `${sun.y}%`,
  } as React.CSSProperties;

  return (
    <section
      aria-label="Greeting"
      className={cn(
        "relative h-[230px] overflow-hidden md:h-[236px] md:rounded-[28px]",
        sky.sky,
      )}
    >
      {phase !== "morning" &&
        STARS.map((star) => (
          <span
            key={star.left}
            aria-hidden
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
      <div
        aria-hidden
        className={cn(
          "absolute top-[94px] left-[76%] -mt-[60px] -ml-[60px] size-[120px] rounded-full blur-[22px] md:top-(--sun-y) md:left-(--sun-x)",
          evening && "opacity-25",
        )}
        style={{ ...place, background: sky.glow }}
      />
      {evening ? (
        <svg
          aria-hidden
          viewBox="0 0 64 64"
          className="absolute top-[94px] left-[76%] -mt-8 -ml-8 size-16 md:top-(--sun-y) md:left-(--sun-x)"
          style={place}
        >
          <path
            d="M44 54 A26 26 0 1 1 44 10 A20 22 0 1 0 44 54 Z"
            fill={sky.sun}
          />
        </svg>
      ) : (
        <div
          aria-hidden
          className="absolute top-[94px] left-[76%] -mt-8 -ml-8 size-16 rounded-full md:top-(--sun-y) md:left-(--sun-x)"
          style={{ ...place, background: sky.sun }}
        />
      )}
      {phase === "morning" && (
        <>
          <svg
            aria-hidden
            viewBox="0 0 70 26"
            className="absolute top-[34px] right-[30%] h-[34px] w-[90px] fill-white opacity-90"
            style={{ animation: "ft-drift 22s ease-in-out infinite alternate" }}
          >
            <path d={CLOUD_PATH} />
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 70 26"
            className="absolute top-[70px] right-[10%] h-6 w-16 fill-white opacity-75"
            style={{
              animation: "ft-drift 28s ease-in-out infinite alternate-reverse",
            }}
          >
            <path d={CLOUD_PATH} />
          </svg>
        </>
      )}
      <svg
        aria-hidden
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[70px] w-full md:h-24"
      >
        <path
          d="M0 70 C200 30 360 60 560 52 C780 42 960 20 1200 46 V120 H0 Z"
          fill={sky.hillBack}
        />
        <path
          d="M0 96 C220 70 420 92 640 84 C860 76 1020 64 1200 78 V120 H0 Z"
          fill={sky.hillFront}
        />
      </svg>
      <div className="flex max-w-[560px] flex-col [&>*:not(time)]:relative gap-1 px-5 pt-[76px] md:gap-2 md:px-9 md:pt-8">
        {children}
      </div>
    </section>
  );
}
