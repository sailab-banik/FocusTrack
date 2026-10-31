"use client";

import { useEffect, useState } from "react";
import { formatLocalTime } from "@/features/timezone/zoned-time";

/** The user's local time, kept current while the page stays open. */
export function LocalClock({
  initialNow,
  timeZone,
  className,
}: {
  initialNow: string;
  timeZone: string;
  className?: string;
}) {
  const [now, setNow] = useState(() => new Date(initialNow));

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <time
      suppressHydrationWarning
      dateTime={now.toISOString()}
      className={className}
    >
      {formatLocalTime(now, timeZone)}
    </time>
  );
}
