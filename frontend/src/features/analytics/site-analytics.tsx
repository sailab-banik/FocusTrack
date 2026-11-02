"use client";

import { Analytics } from "@vercel/analytics/next";
import { redactUrl } from "./redact-url";

export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => ({ ...event, url: redactUrl(event.url) })}
    />
  );
}
