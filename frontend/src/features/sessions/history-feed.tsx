"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/features/categories/queries";
import { loadOlderSessions } from "./load-older";
import type { HistorySession } from "./queries";
import { SessionHistory } from "./session-history";

/**
 * History that loads older pages as the end scrolls into view. The button
 * underneath does the same on tap, for keyboards and when loading fails.
 */
export function HistoryFeed({
  initialSessions,
  initialHasMore,
  projects,
  categories,
  timeZone,
  now,
}: {
  initialSessions: HistorySession[];
  initialHasMore: boolean;
  projects: { id: string; name: string }[];
  categories: Category[];
  timeZone: string;
  now: string;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [failed, setFailed] = useState(false);
  const [loading, startLoading] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  function loadMore() {
    if (loading || !hasMore) return;
    setFailed(false);
    startLoading(async () => {
      // Caught so a dropped connection offers a retry instead of replacing
      // the sessions already on screen with the error page.
      try {
        const page = await loadOlderSessions(sessions.at(-1)!.startedAt);
        setSessions((current) => [...current, ...page.sessions]);
        setHasMore(page.hasMore);
      } catch {
        setFailed(true);
      }
    });
  }

  const onEndVisible = useEffectEvent(() => {
    if (!failed) loadMore();
  });

  useEffect(() => {
    const target = end.current;
    if (!target) return;
    // Starts loading a screen early so scrolling rarely waits.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onEndVisible();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
    // Re-observing after each page keeps loading while the end stays in view.
  }, [sessions.length]);

  return (
    <>
      <SessionHistory
        sessions={sessions}
        projectNames={new Map(projects.map((p) => [p.id, p.name]))}
        categories={new Map(categories.map((c) => [c.id, c]))}
        timeZone={timeZone}
        now={new Date(now)}
      />
      <div ref={end} className="flex flex-col items-center gap-2 py-4">
        {hasMore ? (
          <>
            {failed && (
              <p role="alert" className="text-sm text-destructive">
                Older sessions did not load. Check your connection.
              </p>
            )}
            <Button
              variant="outline"
              size="lg"
              className="h-10 px-4"
              disabled={loading}
              onClick={loadMore}
            >
              {loading ? "Loading older sessions…" : "Load older sessions"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            That is everything, back to your first session.
          </p>
        )}
      </div>
    </>
  );
}
