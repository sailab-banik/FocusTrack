"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TIME_ZONE_COOKIE } from "./zoned-time";

// Mirrors the browser's timezone into a cookie so server-rendered times and
// day boundaries match the user's clock. Re-renders once when it changes.
export function TimeZoneSync({ serverTimeZone }: { serverTimeZone: string }) {
  const router = useRouter();

  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimeZone === serverTimeZone) return;
    const value = encodeURIComponent(browserTimeZone);
    document.cookie = `${TIME_ZONE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router, serverTimeZone]);

  return null;
}
