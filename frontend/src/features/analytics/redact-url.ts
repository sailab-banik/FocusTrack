const SESSION_PAGE = /\/log\/[0-9a-f-]{36}(?=\/|$)/i;

/**
 * Vercel only needs which page was seen and which campaign led there, so session
 * ids and every other query parameter stay out of the analytics data.
 */
export function redactUrl(raw: string): string {
  const url = new URL(raw);
  url.pathname = url.pathname.replace(SESSION_PAGE, "/log/session");
  for (const key of [...url.searchParams.keys()]) {
    if (!key.startsWith("utm_")) url.searchParams.delete(key);
  }
  url.hash = "";
  return url.toString();
}
