"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";
import type { Category } from "@/features/categories/queries";
import { ProjectTile } from "@/features/projects/project-tile";
import {
  formatLocalTime,
  localDayKey,
} from "@/features/timezone/zoned-time";
import { DeleteSessionButton } from "./delete-session-button";
import { formatDuration, sessionSeconds } from "./duration";
import { dayLabel, executionSeconds, groupSessionsByDay } from "./history";
import type { PastSession } from "./queries";
import { SplitBar } from "./split-bar";

type KindFilter = "all" | CategoryKind;

const FILTERS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "execution", label: "Execution" },
  { value: "preparation", label: "Preparation" },
];

const CARD =
  "rounded-3xl bg-paper shadow-[0_1px_2px_rgb(31_27_61/.05),0_8px_24px_rgb(46_42_120/.06)]";

export function SessionHistory({
  sessions,
  projectNames,
  categories,
  timeZone,
  now,
}: {
  sessions: PastSession[];
  projectNames: Map<string, string>;
  categories: Map<string, Category>;
  timeZone: string;
  now: Date;
}) {
  const [filter, setFilter] = useState<KindFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sessions.find((s) => s.id === selectedId);

  // Totals stay the whole day's: the filter narrows the rows, not the facts.
  const days = groupSessionsByDay(sessions, timeZone).flatMap((group) => {
    const rows = group.sessions.filter(
      (s) => filter === "all" || categories.get(s.categoryId)!.kind === filter,
    );
    return rows.length > 0 ? [{ ...group, rows }] : [];
  });

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Kind"
        className="flex self-start rounded-full bg-paper p-1 shadow-[0_1px_2px_rgb(31_27_61/.05),0_4px_12px_rgb(46_42_120/.05)]"
      >
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={filter === option.value}
            onClick={() => setFilter(option.value)}
            data-kind={option.value === "all" ? undefined : option.value}
            className={cn(
              "flex h-11 cursor-pointer items-center gap-[7px] rounded-full px-3.5 text-[13px] font-semibold transition-colors md:h-[34px]",
              filter !== option.value && "text-ink-soft",
              filter === option.value &&
                (option.value === "all"
                  ? "bg-indigo text-white"
                  : "bg-kind-soft text-kind-text"),
            )}
          >
            {option.value !== "all" && (
              <KindMark kind={option.value} className="size-2" />
            )}
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div
          className={cn(
            "flex min-w-0 flex-col gap-[18px]",
            !selected && "lg:col-span-2",
          )}
        >
          {days.length === 0 && (
            <div
              className={`${CARD} flex flex-col items-center gap-2 px-6 py-12 text-center`}
            >
              <p className="font-serif text-[22px]">Nothing here yet</p>
              <p className="text-sm text-ink-soft">
                Try the other kind. Older sessions load as you scroll.
              </p>
            </div>
          )}
          {days.map((day) => {
            const execution = executionSeconds(day.sessions, categories);
            return (
              <section
                key={day.dayKey}
                className={`${CARD} ft-in px-4 pt-[18px] pb-2 md:px-6 md:pt-[22px]`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-3.5">
                  <h2 className="font-serif text-[22px]">
                    {dayLabel(day.dayKey, now, timeZone)}
                  </h2>
                  <span className="flex items-center gap-3">
                    <SplitBar
                      execution={execution}
                      preparation={day.totalSeconds - execution}
                      className="h-2.5 w-[140px]"
                    />
                    <span className="text-[15px] font-bold">
                      {formatDuration(day.totalSeconds)}
                    </span>
                  </span>
                </div>
                <ul className="flex flex-col divide-y divide-line-soft border-t border-line-soft">
                  {day.rows.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      projectName={projectNames.get(session.projectId) ?? ""}
                      category={categories.get(session.categoryId)!}
                      timeZone={timeZone}
                      selected={session.id === selectedId}
                      onSelect={() => setSelectedId(session.id)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {selected && (
          <SessionDetail
            session={selected}
            projectName={projectNames.get(selected.projectId) ?? ""}
            category={categories.get(selected.categoryId)!}
            timeZone={timeZone}
            now={now}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </>
  );
}

function timeRange(session: PastSession, timeZone: string): string {
  return `${formatLocalTime(new Date(session.startedAt), timeZone)}–${formatLocalTime(new Date(session.endedAt), timeZone)}`;
}

function SessionRow({
  session,
  projectName,
  category,
  timeZone,
  selected,
  onSelect,
}: {
  session: PastSession;
  projectName: string;
  category: Category;
  timeZone: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <Link
        href={`/log/${session.id}`}
        aria-current={selected ? "true" : undefined}
        // Desktop has room to open the session beside the list; phones go to
        // its page. A modified click still opens a new tab.
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey) return;
          if (!window.matchMedia("(min-width: 64rem)").matches) return;
          event.preventDefault();
          onSelect();
        }}
        className={cn(
          "-mx-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] px-2 py-3.5 transition-colors hover:bg-mist md:gap-3.5",
          selected && "bg-mist",
        )}
      >
        <ProjectTile id={session.projectId} name={projectName} />
        <span className="flex min-w-0 flex-col gap-1">
          {session.outcome ? (
            <span className="font-serif text-[15px] leading-[21px] md:text-[17px] md:leading-6">
              {session.outcome}
            </span>
          ) : (
            <span className="font-serif text-[15px] leading-[21px] text-ink-muted md:text-[17px] md:leading-6">
              No comment yet. Tap to add one.
            </span>
          )}
          <span
            data-kind={category.kind}
            className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-soft md:text-[13px]"
          >
            {projectName} ·
            <span className="inline-flex items-center gap-[5px] font-medium text-kind-text">
              <KindMark kind={category.kind} className="size-[7px]" />
              {category.name}
              <span className="sr-only">({category.kind})</span>
            </span>
            · {timeRange(session, timeZone)}
          </span>
        </span>
        <span className="text-sm font-semibold md:text-[15px]">
          {formatDuration(sessionSeconds(session))}
        </span>
      </Link>
    </li>
  );
}

function SessionDetail({
  session,
  projectName,
  category,
  timeZone,
  now,
  onClose,
}: {
  session: PastSession;
  projectName: string;
  category: Category;
  timeZone: string;
  now: Date;
  onClose: () => void;
}) {
  return (
    <aside
      aria-labelledby="session-detail"
      className="ft-in sticky top-6 hidden flex-col gap-[18px] rounded-3xl bg-paper p-6 shadow-[0_1px_2px_rgb(31_27_61/.05),0_16px_40px_rgb(46_42_120/.1)] lg:flex"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <ProjectTile id={session.projectId} name={projectName} />
          <h2 id="session-detail" className="truncate text-base font-semibold">
            {projectName}
          </h2>
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-mist text-ink-soft"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      </div>
      <blockquote className="rounded-[18px] bg-mist p-[18px] font-serif text-xl leading-7">
        {session.outcome ?? "No comment yet."}
      </blockquote>
      <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-3 text-sm">
        <dt className="text-ink-muted">When</dt>
        <dd>
          {dayLabel(localDayKey(new Date(session.startedAt), timeZone), now, timeZone)},{" "}
          {timeRange(session, timeZone)}
        </dd>
        <dt className="text-ink-muted">Duration</dt>
        <dd className="font-semibold">
          {formatDuration(sessionSeconds(session))}
        </dd>
        <dt className="text-ink-muted">Category</dt>
        <dd
          data-kind={category.kind}
          className="flex items-center gap-1.5 font-medium text-kind-text"
        >
          <KindMark kind={category.kind} className="size-2" />
          {category.name} · {category.kind}
        </dd>
        {session.pausedSeconds >= 60 && (
          <>
            <dt className="text-ink-muted">Paused</dt>
            <dd>{formatDuration(session.pausedSeconds)}</dd>
          </>
        )}
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/log/${session.id}`}
          className={buttonVariants({
            variant: "secondary",
            className: "h-[42px] rounded-xl px-4 text-sm font-semibold",
          })}
        >
          Edit
        </Link>
        <DeleteSessionButton sessionId={session.id} />
      </div>
    </aside>
  );
}
