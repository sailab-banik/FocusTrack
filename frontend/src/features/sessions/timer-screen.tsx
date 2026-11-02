"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useOptimistic,
  useState,
} from "react";
import type { Category } from "@/features/categories/queries";
import type { Project } from "@/features/projects/queries";
import { closeStaleSession, type ClosedSession } from "./actions";
import { ClosedSessionCard } from "./closed-session-card";
import type { RunningSession } from "./queries";
import { RunningTimer } from "./running-timer";
import type { StartInput } from "./start-input";
import { SavedMoment } from "./stop-dialog";

export const ShowStartedContext = createContext<
  ((sessionId: string, input: StartInput) => void) | null
>(null);

/**
 * The running timer, or `children` (the start panel) when nothing runs.
 * A start shows the timer before its save lands. The start panel stays
 * mounted behind it, so an error from that save still shows when it returns.
 */
export function TimerScreen({
  running,
  projects,
  categories,
  staleSessionId,
  timeZone,
  children,
}: {
  running: RunningSession | null;
  projects: Project[];
  categories: Category[];
  /** A session left on, which this closes and then reports on. */
  staleSessionId: string | null;
  timeZone: string;
  children: React.ReactNode;
}) {
  const [shown, setShown] = useOptimistic(running);
  // Lives here because saving a session unmounts the running timer.
  const [savedLine, setSavedLine] = useState<string | null>(null);
  const clearSaved = useCallback(() => setSavedLine(null), []);
  // Here for the same reason: closing the session refreshes the page.
  const [closed, setClosed] = useState<ClosedSession | null>(null);

  useEffect(() => {
    if (!staleSessionId) return;
    void closeStaleSession(staleSessionId).then((result) => {
      // A second call, from another tab or a remount, finds nothing to close.
      if (result) setClosed(result);
    });
  }, [staleSessionId]);

  function showStarted(sessionId: string, input: StartInput) {
    setShown({
      id: sessionId,
      projectId: input.projectId,
      categoryId: input.categoryId,
      // The server's start time replaces this once the save lands.
      startedAt: new Date().toISOString(),
      pausedAt: null,
      pausedSeconds: 0,
      resumedAt: null,
    });
  }

  return (
    <>
      {closed && (
        <div className="mb-5">
          <ClosedSessionCard
            closed={closed}
            timeZone={timeZone}
            onDismiss={() => setClosed(null)}
          />
        </div>
      )}
      {shown && (
        <ActiveSession
          key={shown.id}
          running={shown}
          projects={projects}
          categories={categories}
          timeZone={timeZone}
          onSaved={setSavedLine}
        />
      )}
      {savedLine && <SavedMoment line={savedLine} onDone={clearSaved} />}
      <div hidden={shown !== null} className="contents">
        <ShowStartedContext value={showStarted}>{children}</ShowStartedContext>
      </div>
    </>
  );
}

function ActiveSession({
  running,
  projects,
  categories,
  timeZone,
  onSaved,
}: {
  running: RunningSession;
  projects: Project[];
  categories: Category[];
  timeZone: string;
  onSaved: (line: string) => void;
}) {
  // Foreign keys keep a session's project and category from being removed.
  const project = projects.find((p) => p.id === running.projectId)!;
  const category = categories.find((c) => c.id === running.categoryId)!;

  return (
    <RunningTimer
      sessionId={running.id}
      startedAt={running.startedAt}
      pausedAt={running.pausedAt}
      pausedSeconds={running.pausedSeconds}
      resumedAt={running.resumedAt}
      projectId={project.id}
      projectName={project.name}
      timeZone={timeZone}
      onSaved={onSaved}
      categoryName={category.name}
      kind={category.kind}
    />
  );
}
