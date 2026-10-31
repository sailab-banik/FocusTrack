"use client";

import { useState } from "react";
import { cn } from "cn";
import { KindMark } from "@/features/categories/kind-mark";
import { ProjectTile } from "@/features/projects/project-tile";
import { formatDuration } from "@/features/sessions/duration";
import { SplitBar } from "@/features/sessions/split-bar";
import { percent } from "@/features/work/allocation";
import { CHART_CARD } from "./chart-card";
import {
  heatLevel,
  type CalendarDay,
  type DayTotals,
  type MonthCalendar,
  type ProjectShare,
} from "./insights";

const HEAT = ["bg-[#eeebfa]", "bg-[#cfc9f5]", "bg-[#a49bea]", "bg-[#6e63d6]", "bg-[#3e33a8]"];

function dayName(dayKey: string): string {
  // Noon UTC keeps the calendar date stable when formatting as UTC.
  return new Date(`${dayKey}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function dayReadout(day: DayTotals): string {
  const total = day.execution + day.preparation;
  if (total === 0) return `${dayName(day.dayKey)}: nothing tracked.`;
  return `${dayName(day.dayKey)}: ${formatDuration(total)}, ${formatDuration(day.execution)} execution and ${formatDuration(day.preparation)} preparation.`;
}

export function WeekDaysChart({
  days,
  total,
}: {
  days: DayTotals[];
  total: number;
}) {
  const busiest = days.reduce(
    (best, day, index) =>
      day.execution + day.preparation >
      days[best].execution + days[best].preparation
        ? index
        : best,
    0,
  );
  const [selected, setSelected] = useState(busiest);
  const max = Math.max(1, ...days.map((d) => d.execution + d.preparation));

  return (
    <section aria-labelledby="week-chart" className={CHART_CARD}>
      <div className="flex items-baseline justify-between">
        <h3 id="week-chart" className="font-serif text-xl">
          Day by day
        </h3>
        <span className="text-[13px] text-ink-soft">
          {formatDuration(total)}
        </span>
      </div>
      <div className="flex items-center gap-3.5 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <KindMark kind="execution" className="size-2" />
          Execution
        </span>
        <span className="flex items-center gap-1.5">
          <KindMark kind="preparation" className="size-2" />
          Preparation
        </span>
      </div>
      <div className="flex h-[170px] items-end gap-2 border-b border-line-soft">
        {days.map((day, index) => {
          const dayTotal = day.execution + day.preparation;
          return (
            <button
              key={day.dayKey}
              type="button"
              aria-pressed={index === selected}
              aria-label={dayReadout(day)}
              onClick={() => setSelected(index)}
              className={cn(
                "flex h-full flex-1 cursor-pointer flex-col items-center justify-end rounded-t-xl pb-0.5 transition-colors",
                index === selected && "bg-mist",
              )}
            >
              {dayTotal > 0 && (
                <span
                  className="ft-up flex w-[70%] max-w-[30px] flex-col gap-0.5"
                  style={{
                    height: `${(dayTotal / max) * 88}%`,
                    minHeight: 4,
                    animationDelay: `${index * 60}ms`,
                  }}
                >
                  {day.preparation > 0 && (
                    <span
                      className="rounded-t-md rounded-b-[2px] bg-periwinkle"
                      style={{ flex: day.preparation }}
                    />
                  )}
                  {day.execution > 0 && (
                    <span
                      className="rounded-t-[2px] rounded-b-md bg-tangerine"
                      style={{ flex: day.execution }}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div aria-hidden className="flex gap-2 text-xs">
        {days.map((day, index) => (
          <span
            key={day.dayKey}
            className={cn(
              "flex-1 text-center",
              index === selected
                ? "font-bold text-ink"
                : "font-medium text-ink-muted",
            )}
          >
            {day.label}
          </span>
        ))}
      </div>
      <div
        role="status"
        className="rounded-[14px] bg-mist px-3.5 py-3 text-sm text-[#3e3a5e]"
      >
        {dayReadout(days[selected])}
      </div>
    </section>
  );
}

export function MonthHeatmap({
  title,
  calendar,
}: {
  title: string;
  calendar: MonthCalendar;
}) {
  const lastElapsed = calendar.days.filter((d) => !d.future).at(-1);
  const [selected, setSelected] = useState<CalendarDay | undefined>(lastElapsed);

  return (
    <section aria-labelledby="month-chart" className={CHART_CARD}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="month-chart" className="font-serif text-xl">
          {title}
        </h3>
        <span className="text-[13px] text-ink-soft">
          {calendar.trackedDays} of {calendar.elapsedDays} days tracked
        </span>
      </div>
      <div
        aria-hidden
        className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-ink-muted"
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: calendar.leadingBlanks }, (_, index) => (
          <span key={index} />
        ))}
        {calendar.days.map((day) => {
          const level = heatLevel(day.execution + day.preparation);
          return (
            <button
              key={day.dayKey}
              type="button"
              disabled={day.future}
              aria-label={dayReadout(day)}
              aria-pressed={selected?.dayKey === day.dayKey}
              onClick={() => setSelected(day)}
              className={cn(
                "aspect-square rounded-[10px] p-[5px] text-left align-top text-[11px] leading-none font-semibold",
                day.future
                  ? "border-[1.5px] border-dashed border-line text-ink-muted opacity-60"
                  : ["cursor-pointer", HEAT[level]],
                !day.future && level >= 3 ? "text-white" : "text-ink",
                selected?.dayKey === day.dayKey &&
                  "outline-2 -outline-offset-2 outline-ink",
              )}
            >
              <span className="block h-full">{day.dayOfMonth}</span>
            </button>
          );
        })}
      </div>
      <div aria-hidden className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        <span>Less</span>
        {HEAT.map((color) => (
          <span key={color} className={`size-3.5 rounded-[4px] ${color}`} />
        ))}
        <span>3h+</span>
      </div>
      {selected && (
        <div
          role="status"
          className="rounded-[14px] bg-mist px-3.5 py-3 text-sm text-[#3e3a5e]"
        >
          {dayReadout(selected)}
        </div>
      )}
    </section>
  );
}

export function WhereTimeWent({
  title,
  shares,
  projects,
}: {
  title: string;
  shares: ProjectShare[];
  projects: Map<string, string>;
}) {
  const max = Math.max(
    1,
    ...shares.map((share) => share.execution + share.preparation),
  );

  return (
    <section className={CHART_CARD}>
      <h3 className="font-serif text-xl">{title}</h3>
      {shares.length === 0 && (
        <p className="text-sm text-ink-soft">No finished sessions yet.</p>
      )}
      {shares.map((share) => {
        const total = share.execution + share.preparation;
        const name = projects.get(share.projectId) ?? "";
        return (
          <div
            key={share.projectId}
            className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2.5"
          >
            <ProjectTile id={share.projectId} name={name} size="sm" />
            <span className="flex min-w-0 flex-col gap-[5px]">
              <span className="truncate text-[13px] font-medium">{name}</span>
              <span style={{ width: `${(total / max) * 100}%` }}>
                <SplitBar
                  execution={share.execution}
                  preparation={share.preparation}
                  className="h-2"
                />
              </span>
            </span>
            <span className="text-right text-[13px] font-semibold">
              {formatDuration(total)}
              <span className="sr-only">
                , {percent(share.execution, total)}% execution
              </span>
            </span>
          </div>
        );
      })}
    </section>
  );
}
