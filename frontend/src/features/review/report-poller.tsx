"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const POLL_MS = 5_000;

/** Re-renders the page until the report being written has arrived. */
export function ReportPoller() {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
