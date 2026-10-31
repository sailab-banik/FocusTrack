"use client";

import { usePathname } from "next/navigation";
import { createContext, use, useState } from "react";
import { cn } from "cn";
import { SETUP_READY_PATH, WELCOME_PATH } from "@/features/auth/routes";

type Direction = "forward" | "back";

type Tour = {
  /** The tour page on view, or null while on the welcome cover. */
  page: number | null;
  direction: Direction;
  goTo: (page: number | null, direction: Direction) => void;
};

export const TourContext = createContext<Tour | null>(null);

// Lives in a layout so it survives navigating between pages: the sky keeps
// moving instead of remounting, and coming back from sign-up lands on the tour
// page that was left.
export function SunriseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [page, setPage] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction>("forward");
  const [hasMoved, setHasMoved] = useState(false);

  const onWelcome = pathname === WELCOME_PATH;
  const stage = onWelcome
    ? page === null
      ? "cover"
      : "tour"
    : pathname === SETUP_READY_PATH
      ? "ready"
      : "day";

  function goTo(next: number | null, nextDirection: Direction) {
    setPage(next);
    setDirection(nextDirection);
    setHasMoved(true);
  }

  return (
    <TourContext value={{ page, direction, goTo }}>
      <div
        data-stage={stage}
        data-tour={stage === "tour" ? page : undefined}
        className="daylight"
      >
        <Sky rising={stage === "cover" && !hasMoved} />
        <span className="sunrise-logo absolute top-[22px] left-5 z-3 flex items-center gap-2.5 text-[15px] font-semibold lg:top-8 lg:left-12 lg:text-base">
          <svg viewBox="0 0 26 26" className="size-7" aria-hidden>
            <rect
              width="26"
              height="26"
              rx="8"
              className="sunrise-logo-bg"
            />
            <circle cx="13" cy="15" r="5" fill="#FFD9C2" />
            <rect x="6" y="18" width="14" height="3" rx="1.5" fill="#E8742A" />
          </svg>
          FocusTrack
        </span>
        {children}
      </div>
    </TourContext>
  );
}

const STARS = [
  { left: "12%", top: "11%", size: 3, delay: "0s" },
  { left: "31%", top: "18%", size: 2, delay: "0.7s" },
  { left: "59%", top: "14%", size: 2, delay: "1.8s" },
  { left: "77%", top: "9%", size: 3, delay: "1.2s" },
  { left: "87%", top: "21%", size: 2, delay: "0.3s" },
];

const CLOUD_PATH =
  "M10 22 a9 9 0 0 1 4-17 a12 12 0 0 1 22 2 a9 9 0 0 1 16 4 a7 7 0 0 1 8 11 Z";

function Sky({ rising }: { rising: boolean }) {
  return (
    <div aria-hidden className="sky">
      <div className="sky-layer sky-dawn" />
      <div className="sky-layer sky-morning" />
      <div className="sky-layer sky-day" />
      <div className="sky-layer sky-stars">
        {STARS.map((star) => (
          <span
            key={star.left}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>
      <div className="sun">
        <div className={cn(rising && "sun-rising")}>
          <span className="sun-glow" />
          <span className="sun-core" />
        </div>
      </div>
      <svg
        viewBox="0 0 70 26"
        className="cloud cloud-a h-[34px] w-[90px] lg:h-12 lg:w-[130px]"
        opacity=".85"
      >
        <path d={CLOUD_PATH} />
      </svg>
      <svg
        viewBox="0 0 70 26"
        className="cloud cloud-b h-6 w-16 lg:h-[34px] lg:w-[90px]"
        opacity=".7"
      >
        <path d={CLOUD_PATH} />
      </svg>
      <svg viewBox="0 0 390 90" preserveAspectRatio="none" className="hills">
        <path
          d="M0 46 C80 18 160 40 240 32 C310 24 350 16 390 26 V90 H0 Z"
          className="hill-back"
        />
        <path
          d="M0 70 C90 50 180 66 270 58 C330 54 360 48 390 54 V90 H0 Z"
          className="hill-front"
        />
      </svg>
    </div>
  );
}

export function useTour(): Tour {
  // Always rendered inside SunriseShell.
  return use(TourContext)!;
}
