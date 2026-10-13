"use client";

import { useEffect } from "react";
import { requestDueReports } from "./actions";

// Coming back to the tab counts as opening the app, at most this often.
const RECHECK_MS = 10 * 60_000;

/**
 * Asks for the reports that are due when the app is opened or brought back
 * into view. Nothing runs on a schedule: a report is written the first time
 * the user is around after its period has ended.
 */
export function DueReports() {
  useEffect(() => {
    let requestedAt = 0;
    function request() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - requestedAt < RECHECK_MS) return;
      requestedAt = Date.now();
      void requestDueReports(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    request();
    document.addEventListener("visibilitychange", request);
    return () => document.removeEventListener("visibilitychange", request);
  }, []);

  return null;
}
