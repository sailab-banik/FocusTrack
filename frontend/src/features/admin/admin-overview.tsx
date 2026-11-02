"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "cn";
import {
  RANGES,
  tokenCost,
  type Overview,
  type OverviewUser,
  type Range,
  type UserStatus,
} from "./overview";
import type { VisitorResult } from "./visitors";
import type { PeriodKind } from "@/features/review/periods";

const CARD =
  "flex min-w-0 flex-col rounded-3xl bg-paper px-5 py-[22px] shadow-[0_1px_2px_rgb(31_27_61/.05),0_8px_24px_rgb(46_42_120/.06)] md:px-6";
const HEADING = "font-serif text-[21px]";
const TH = "border-b border-line-soft px-2 py-2.5 text-xs font-semibold text-ink-muted";
const TD = "border-b border-line-soft px-2 py-3";

// A categorical set of its own, so execution and preparation keep their
// meaning. Gold falls under 3:1 on white, so a legend and table always go with it.
const TYPES: { kind: PeriodKind; label: string; short: string; color: string }[] = [
  { kind: "day", label: "Daily reads", short: "Daily", color: "#2E9C8A" },
  { kind: "week", label: "Weekly reads", short: "Weekly", color: "#8B6CE0" },
  { kind: "month", label: "Monthly reads", short: "Monthly", color: "#D99A1E" },
];

const RATES_KEY = "focustrack-admin-rates";
const EXAMPLE_RATES = { input: 1.25, output: 10 };

const STATUS_STYLES: Record<NonNullable<UserStatus>, string> = {
  Active: "bg-mint text-mint-text",
  Quiet: "bg-butter text-[#6b4e00]",
  New: "bg-periwinkle-soft text-[#3b3fb0]",
};

type UserFilter = "All" | "Active" | "Quiet" | "New" | "No reports";
const FILTERS: UserFilter[] = ["All", "Active", "Quiet", "New", "No reports"];
type SortKey = "sessions" | "reports" | "cost";

function money(value: number): string {
  if (value >= 100) return `$${Math.round(value).toLocaleString("en-US")}`;
  return `$${value.toFixed(2)}`;
}

function fineMoney(value: number): string {
  return value < 0.01 ? `$${value.toFixed(4)}` : `$${value.toFixed(3)}`;
}

function tokens(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function shortDay(iso: string): string {
  return new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString(
    "en-US",
    { timeZone: "UTC", month: "short", day: "numeric" },
  );
}

export function AdminOverview({
  overviews,
  visitors,
  model,
  today,
}: {
  overviews: Record<Range, Overview>;
  visitors: Record<Range, VisitorResult>;
  model: string | null;
  today: string;
}) {
  const [range, setRange] = useState<Range>(30);
  const [rates, setRates] = useState(EXAMPLE_RATES);
  const overview = overviews[range];

  // A per-viewer convenience: the page works the same if storage is blocked.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RATES_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage only exists after hydration.
      if (saved) setRates(JSON.parse(saved));
    } catch {}
  }, []);

  function updateRate(key: "input" | "output", value: string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    const next = { ...rates, [key]: parsed };
    setRates(next);
    try {
      localStorage.setItem(RATES_KEY, JSON.stringify(next));
    } catch {}
  }

  const totals = TYPES.reduce(
    (sum, type) => ({
      count: sum.count + overview.types[type.kind].count,
      input: sum.input + overview.types[type.kind].input,
      output: sum.output + overview.types[type.kind].output,
    }),
    { count: 0, input: 0, output: 0 },
  );
  const totalCost = tokenCost(totals.input, totals.output, rates);
  const monthlyCost = (totalCost / range) * 30;

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-[34px] leading-10 md:text-[38px] md:leading-11">
            Overview
          </h1>
          <p className="text-[15px] text-ink-soft">
            Last {range} days, up to {today}. Totals and usage only, never
            session comments or project names.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Date range"
          className="flex gap-1 rounded-full bg-paper p-1 shadow-[0_1px_2px_rgb(31_27_61/.05),0_4px_12px_rgb(46_42_120/.05)]"
        >
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={option === range}
              onClick={() => setRange(option)}
              className={cn(
                "h-11 cursor-pointer rounded-full px-4 text-[13px] font-semibold transition-colors md:h-9",
                option === range ? "bg-indigo text-white" : "text-ink-soft",
              )}
            >
              {option} days
            </button>
          ))}
        </div>
      </div>

      <section
        aria-label="Key numbers"
        className="grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] overflow-hidden rounded-3xl bg-paper shadow-[0_1px_2px_rgb(31_27_61/.05),0_8px_24px_rgb(46_42_120/.06)]"
      >
        <Kpi
          label="People"
          value={overview.people.toLocaleString("en-US")}
          sub={`${overview.newPeople} new in this range`}
        />
        <Kpi
          label="Active"
          value={overview.activePeople.toLocaleString("en-US")}
          sub="had a session in this range"
        />
        <Kpi
          label="Sessions"
          value={overview.sessions.toLocaleString("en-US")}
          sub="finished in this range"
        />
        <Kpi
          label="AI reports"
          value={totals.count.toLocaleString("en-US")}
          sub={`${tokens(totals.input + totals.output)} tokens`}
        />
        <Kpi
          label="AI spend"
          value={money(totalCost)}
          sub="at the rates below"
        />
      </section>

      <ConversionFunnel overview={overview} visitors={visitors[range]} />

      <div className="flex flex-wrap gap-5">
        <ActiveChart key={`active-${range}`} overview={overview} />
        <SpendChart key={`spend-${range}`} overview={overview} rates={rates} />
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <section
          aria-labelledby="admin-types"
          className={`${CARD} flex-[3_1_520px] gap-2.5`}
        >
          <h2 id="admin-types" className={`${HEADING} mb-1.5`}>
            Spend by report type
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} pl-0 text-left`}>
                    Type
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Reports
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Input tokens
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Output tokens
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Per report
                  </th>
                  <th scope="col" className={`${TH} pr-0 text-right`}>
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {TYPES.map((type) => {
                  const row = overview.types[type.kind];
                  const cost = tokenCost(row.input, row.output, rates);
                  return (
                    <tr key={type.kind}>
                      <th
                        scope="row"
                        className={`${TD} pl-0 text-left font-semibold`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden
                            className="size-[9px] rounded-[3px]"
                            style={{ background: type.color }}
                          />
                          {type.label}
                        </span>
                      </th>
                      <td className={`${TD} text-right`}>{row.count}</td>
                      <td className={`${TD} text-right`}>{tokens(row.input)}</td>
                      <td className={`${TD} text-right`}>{tokens(row.output)}</td>
                      <td className={`${TD} text-right text-ink-soft`}>
                        {row.count > 0 ? fineMoney(cost / row.count) : "—"}
                      </td>
                      <td className={`${TD} pr-0 text-right font-bold`}>
                        {money(cost)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold">
                  <th scope="row" className="py-3 pr-2 text-left">
                    Total
                  </th>
                  <td className="px-2 py-3 text-right">{totals.count}</td>
                  <td className="px-2 py-3 text-right">
                    {tokens(totals.input)}
                  </td>
                  <td className="px-2 py-3 text-right">
                    {tokens(totals.output)}
                  </td>
                  <td className="px-2 py-3 text-right font-normal text-ink-soft">
                    {totals.count > 0
                      ? fineMoney(totalCost / totals.count)
                      : "—"}
                  </td>
                  <td className="py-3 pl-2 text-right font-serif text-lg font-normal">
                    {money(totalCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {overview.uncountedReports > 0 && (
            <p className="text-xs text-ink-muted">
              {overview.uncountedReports} reports were written before token
              counts were stored, so they count as $0 here.
            </p>
          )}
        </section>

        <section
          aria-labelledby="admin-pricing"
          className="flex min-w-0 flex-[2_1_300px] flex-col gap-3 rounded-3xl bg-lilac px-5 py-[22px] md:px-6"
        >
          <h2 id="admin-pricing" className={HEADING}>
            Model pricing
          </h2>
          <p className="text-[13px] leading-[19px] text-[#3e3a5e]">
            {model ?? "No model configured"}. Example rates; enter your
            provider’s and every cost on this page updates. Saved in this
            browser only.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <RateInput
              id="rate-input"
              label="Input, $ per 1M"
              value={rates.input}
              onChange={(value) => updateRate("input", value)}
            />
            <RateInput
              id="rate-output"
              label="Output, $ per 1M"
              value={rates.output}
              onChange={(value) => updateRate("output", value)}
            />
          </div>
          <div className="flex flex-col gap-1 rounded-[14px] bg-white/70 px-3.5 py-3">
            <span className="text-xs font-semibold text-ink-soft">
              At this pace, a month costs about
            </span>
            <span className="font-serif text-[26px]">{money(monthlyCost)}</span>
            <span className="text-xs text-ink-soft">
              {overview.activePeople > 0
                ? `${money(monthlyCost / overview.activePeople)} per active person`
                : "No active people in this range"}
            </span>
          </div>
        </section>
      </div>

      <UsersTable users={overview.users} rates={rates} />
      <ReportHealth overview={overview} />
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-r border-b border-line-soft px-[22px] py-5">
      <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
      <span className="font-serif text-[30px] leading-9">{value}</span>
      <span className="text-xs text-ink-muted">{sub}</span>
    </div>
  );
}

function shareOf(part: number, whole: number | undefined): string {
  if (!whole) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function ConversionFunnel({
  overview,
  visitors: result,
}: {
  overview: Overview;
  visitors: VisitorResult;
}) {
  const { funnel } = overview;
  const visitors = result.ok ? result.counts : null;
  const steps: { label: string; count: number | null; share: string }[] = [
    {
      label: "Visited the welcome page",
      count: visitors?.welcome ?? null,
      share: "",
    },
    {
      label: "Opened sign-up",
      count: visitors?.signup ?? null,
      share: visitors
        ? `${shareOf(visitors.signup, visitors.welcome)} of visitors`
        : "",
    },
    {
      label: "Created an account",
      count: funnel.signups,
      share: visitors
        ? `${shareOf(funnel.signups, visitors.welcome)} of visitors`
        : "",
    },
    {
      label: "Logged a first session",
      count: funnel.firstSession,
      share: `${shareOf(funnel.firstSession, funnel.signups)} of accounts`,
    },
    {
      label: "Came back a week later",
      count: funnel.returned,
      share:
        funnel.returnEligible === 0
          ? "No one has had a week yet"
          : `${shareOf(funnel.returned, funnel.returnEligible)} of ${funnel.returnEligible} who have had a week`,
    },
  ];
  const widest = Math.max(1, ...steps.map((step) => step.count ?? 0));

  return (
    <section
      aria-labelledby="admin-funnel"
      className={`${CARD} gap-3.5`}
    >
      <h2 id="admin-funnel" className={HEADING}>
        Conversion
      </h2>
      <ol className="flex flex-col">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex flex-col gap-2 border-b border-line-soft py-3 last:border-b-0"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
              <span className="font-semibold">{step.label}</span>
              <span className="flex items-baseline gap-3">
                <span className="text-xs text-ink-muted">{step.share}</span>
                <span className="font-serif text-lg">
                  {step.count === null
                    ? "—"
                    : step.count.toLocaleString("en-US")}
                </span>
              </span>
            </div>
            <span aria-hidden className="block h-2 rounded-full bg-wash">
              {step.count !== null && step.count > 0 && (
                <span
                  className="block h-full rounded-full bg-indigo"
                  style={{ width: `${(step.count / widest) * 100}%` }}
                />
              )}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-muted">
        {!result.ok &&
          `Visitor counts are unavailable (${result.reason}), so the rates from visitors are hidden. `}
        Accounts and sessions follow people who joined in this range. Visitors
        are an estimate: counting started when Web Analytics was turned on, ad
        blockers hide some, and anyone who joins from the sign-in page skips
        sign-up.
      </p>
    </section>
  );
}

function RateInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold">
        {label}
      </label>
      <input
        id={id}
        type="number"
        step="0.05"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 rounded-xl border-[1.5px] border-white bg-white px-3 text-[15px] font-semibold outline-none focus:border-periwinkle focus:shadow-[0_0_0_4px_var(--color-periwinkle-soft)]"
      />
    </div>
  );
}

function ChartAxis({ overview }: { overview: Overview }) {
  return (
    <div
      aria-hidden
      className="flex justify-between text-[11px] text-ink-muted"
    >
      <span>{shortDay(overview.days[0].dayKey)}</span>
      <span>{shortDay(overview.days.at(-1)!.dayKey)}</span>
    </div>
  );
}

function ActiveChart({ overview }: { overview: Overview }) {
  const [selected, setSelected] = useState(overview.days.length - 1);
  const max = Math.max(1, ...overview.days.map((d) => d.active));
  const day = overview.days[selected];

  return (
    <section
      aria-labelledby="admin-active"
      className={`${CARD} flex-[1_1_420px] gap-3.5`}
    >
      <h2 id="admin-active" className={HEADING}>
        People active each day
      </h2>
      <div className="flex h-[170px] items-end gap-px border-b border-line-soft sm:gap-[3px]">
        {overview.days.map((d, index) => (
          <button
            key={d.dayKey}
            type="button"
            aria-label={`${shortDay(d.dayKey)}: ${d.active} active`}
            aria-pressed={index === selected}
            title={`${shortDay(d.dayKey)}: ${d.active} active`}
            onClick={() => setSelected(index)}
            className="flex h-full min-w-0 flex-1 cursor-pointer items-end"
          >
            <span
              className={cn(
                "ft-up block w-full rounded-t-[3px]",
                index === selected ? "bg-indigo" : "bg-[#a49bea]",
              )}
              style={{
                height: `${(d.active / max) * 94}%`,
                minHeight: d.active > 0 ? 3 : 0,
              }}
            />
          </button>
        ))}
      </div>
      <ChartAxis overview={overview} />
      <div
        role="status"
        className="rounded-xl bg-mist px-3 py-2.5 text-[13px] text-[#3e3a5e]"
      >
        {shortDay(day.dayKey)}: {day.active}{" "}
        {day.active === 1 ? "person" : "people"} active.
      </div>
    </section>
  );
}

function SpendChart({
  overview,
  rates,
}: {
  overview: Overview;
  rates: { input: number; output: number };
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const costs = overview.days.map((day) =>
    TYPES.map((type) =>
      tokenCost(day.reports[type.kind].input, day.reports[type.kind].output, rates),
    ),
  );
  const totalOf = (index: number) => costs[index].reduce((a, b) => a + b, 0);
  const max = Math.max(...costs.map((_, index) => totalOf(index)));
  const countOf = (index: number) =>
    TYPES.reduce(
      (sum, type) => sum + overview.days[index].reports[type.kind].count,
      0,
    );
  const describe = (index: number) =>
    `${shortDay(overview.days[index].dayKey)}: ${fineMoney(totalOf(index))} across ${countOf(index)} reports`;

  return (
    <section
      aria-labelledby="admin-spend"
      className={`${CARD} flex-[1_1_420px] gap-3.5`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="admin-spend" className={HEADING}>
          AI spend each day
        </h2>
        <span className="text-xs text-ink-muted">
          Spikes when weeks and months close
        </span>
      </div>
      <div className="flex flex-wrap gap-3.5 text-xs text-ink-soft">
        {TYPES.map((type) => (
          <span key={type.kind} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-[9px] rounded-[3px]"
              style={{ background: type.color }}
            />
            {type.label}
          </span>
        ))}
      </div>
      <div className="flex h-[148px] items-end gap-px border-b border-line-soft sm:gap-[3px]">
        {overview.days.map((day, index) => (
          <button
            key={day.dayKey}
            type="button"
            aria-label={describe(index)}
            aria-pressed={index === selected}
            title={describe(index)}
            onClick={() => setSelected(index)}
            className={cn(
              "flex h-full min-w-0 flex-1 cursor-pointer items-end transition-opacity",
              selected !== null && selected !== index && "opacity-45",
            )}
          >
            {totalOf(index) > 0 && (
              <span
                className="ft-up flex w-full flex-col-reverse gap-px"
                style={{
                  height: `${(totalOf(index) / max) * 94}%`,
                  minHeight: 2,
                }}
              >
                {TYPES.map((type, typeIndex) =>
                  costs[index][typeIndex] > 0 ? (
                    <span
                      key={type.kind}
                      className="rounded-[2px]"
                      style={{
                        // Shares of the day: flex-grow under 1 leaves space unfilled.
                        flex: costs[index][typeIndex] / totalOf(index),
                        background: type.color,
                      }}
                    />
                  ) : null,
                )}
              </span>
            )}
          </button>
        ))}
      </div>
      <ChartAxis overview={overview} />
      <div
        role="status"
        className="rounded-xl bg-mist px-3 py-2.5 text-[13px] text-[#3e3a5e]"
      >
        {selected === null
          ? "Tap a day to see what it cost."
          : describe(selected)}
      </div>
    </section>
  );
}

function SortHeader({
  id,
  label,
  current,
  onSort,
}: {
  id: SortKey;
  label: string;
  current: SortKey;
  onSort: (key: SortKey) => void;
}) {
  const active = current === id;
  return (
    <th
      scope="col"
      aria-sort={active ? "descending" : "none"}
      className="border-b border-line-soft px-2 py-1.5 text-right"
    >
      <button
        type="button"
        onClick={() => onSort(id)}
        className={cn(
          "h-[30px] cursor-pointer rounded-lg px-1.5 text-xs font-bold text-ink-soft",
          active && "bg-wash",
        )}
      >
        {label}
        {active && " ↓"}
      </button>
    </th>
  );
}

function UsersTable({
  users,
  rates,
}: {
  users: OverviewUser[];
  rates: { input: number; output: number };
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("cost");

  const shown = useMemo(() => {
    const search = query.trim().toLowerCase();
    const cost = (u: OverviewUser) => tokenCost(u.input, u.output, rates);
    return users
      .filter((user) => {
        if (filter === "No reports" && user.reports > 0) return false;
        if (filter !== "All" && filter !== "No reports" && user.status !== filter) {
          return false;
        }
        return (
          !search ||
          user.name.toLowerCase().includes(search) ||
          user.maskedEmail.toLowerCase().includes(search)
        );
      })
      .toSorted((a, b) => {
        if (sortKey === "sessions") return b.sessions - a.sessions;
        if (sortKey === "reports") return b.reports - a.reports;
        return cost(b) - cost(a);
      });
  }, [users, query, filter, sortKey, rates]);

  return (
    <section
      id="users"
      aria-labelledby="admin-users"
      className={`${CARD} gap-3.5 pb-3.5`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="admin-users" className={HEADING}>
          Users
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="admin-search" className="sr-only">
            Search users
          </label>
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="h-11 w-[200px] rounded-full border-[1.5px] border-line bg-paper px-3.5 text-base outline-none focus:border-periwinkle focus:shadow-[0_0_0_4px_var(--color-periwinkle-soft)] md:h-10 md:text-[13px]"
          />
          <div
            role="radiogroup"
            aria-label="Filter users"
            className="flex flex-wrap gap-1.5"
          >
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={filter === option}
                onClick={() => setFilter(option)}
                className={cn(
                  "h-11 cursor-pointer rounded-full px-3 text-xs font-bold md:h-[34px]",
                  filter === option
                    ? "bg-indigo text-white"
                    : "bg-wash text-ink-soft",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className={`${TH} pl-0 text-left`}>
                Person
              </th>
              <th scope="col" className={`${TH} text-left`}>
                Joined
              </th>
              <th scope="col" className={`${TH} text-left`}>
                Last active
              </th>
              <SortHeader id="sessions" label="Sessions" current={sortKey} onSort={setSortKey} />
              <th scope="col" className={`${TH} text-left`}>
                Execution
              </th>
              <SortHeader id="reports" label="Reports" current={sortKey} onSort={setSortKey} />
              <th scope="col" className={`${TH} text-right`}>
                Tokens
              </th>
              <SortHeader id="cost" label="AI cost" current={sortKey} onSort={setSortKey} />
              <th scope="col" className={`${TH} pr-0 text-left`}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((user) => (
              <tr key={user.id}>
                <th scope="row" className={`${TD} pl-0 text-left font-normal`}>
                  <span className="flex flex-col">
                    <span className="font-semibold">{user.name || "No name"}</span>
                    <span className="text-xs text-ink-muted">
                      {user.maskedEmail}
                    </span>
                  </span>
                </th>
                <td className={`${TD} text-ink-soft`}>{shortDay(user.joined)}</td>
                <td className={TD}>
                  {user.lastActive ? shortDay(user.lastActive) : "—"}
                </td>
                <td className={`${TD} text-right font-semibold`}>
                  {user.sessions}
                </td>
                <td className={TD}>
                  {user.executionPercent === null ? (
                    <span className="text-xs text-ink-muted">—</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span
                        role="img"
                        aria-label={`${user.executionPercent} percent execution`}
                        className="flex h-2 w-[70px] gap-0.5"
                      >
                        {user.executionPercent > 0 && (
                          <span
                            className="rounded-full bg-tangerine"
                            style={{ width: `${user.executionPercent}%` }}
                          />
                        )}
                        {user.executionPercent < 100 && (
                          <span className="flex-1 rounded-full bg-periwinkle" />
                        )}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {user.executionPercent}%
                      </span>
                    </span>
                  )}
                </td>
                <td className={`${TD} text-right`}>{user.reports}</td>
                <td className={`${TD} text-right text-ink-soft`}>
                  {tokens(user.input + user.output)}
                </td>
                <td className={`${TD} text-right font-bold`}>
                  {money(tokenCost(user.input, user.output, rates))}
                </td>
                <td className={`${TD} pr-0`}>
                  {user.status ? (
                    <span
                      className={cn(
                        "inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-xs font-bold",
                        STATUS_STYLES[user.status],
                      )}
                    >
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full bg-current"
                      />
                      {user.status}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && (
        <p className="py-6 text-center text-sm text-ink-soft">
          No one matches that. Try another name or filter.
        </p>
      )}
      <p className="text-xs text-ink-muted">
        New: joined in the last 7 days. Active: a session in the last 7. Quiet:
        none in 14 or more. Emails are masked here on purpose.
      </p>
    </section>
  );
}

function ReportHealth({ overview }: { overview: Overview }) {
  const { health } = overview;
  const labelOf = (kind: PeriodKind) => TYPES.find((t) => t.kind === kind)!;

  return (
    <section
      id="health"
      aria-labelledby="admin-health"
      className={`${CARD} gap-4`}
    >
      <h2 id="admin-health" className={HEADING}>
        Report health
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3.5">
        <HealthCard
          className="bg-mint text-mint-text"
          title="Written first try"
          value={
            health.firstTryPercent === null ? "—" : `${health.firstTryPercent}%`
          }
          note={`Of ${health.written} written in this range.`}
        />
        <HealthCard
          className="bg-butter text-[#6b4e00]"
          title="Failed, retried later"
          value={String(health.failedAttempts)}
          note="Retried the next time each person opens the app."
        />
        <HealthCard
          className="bg-wash text-[#3e3a5e]"
          title="Median write time"
          value={
            health.medianWriteMs === null
              ? "—"
              : `${(health.medianWriteMs / 1000).toFixed(1)}s`
          }
          note="Runs after the page loads, so nobody waits on it."
        />
        <HealthCard
          className="bg-wash text-[#3e3a5e]"
          title="People with no reports"
          value={String(health.peopleWithoutReports)}
          note="Everything else works for them as usual."
        />
      </div>
      <div className="flex flex-col">
        <span className="border-b border-line-soft pb-2 text-[13px] font-bold">
          Recent failures
        </span>
        {health.failures.length === 0 && (
          <p className="py-3 text-[13px] text-ink-soft">
            None in this range.
          </p>
        )}
        {health.failures.map((failure, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-line-soft py-3 text-[13px] last:border-b-0 md:grid-cols-[110px_120px_minmax(0,1fr)_auto]"
          >
            <span className="text-ink-muted">{shortDay(failure.at)}</span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span
                aria-hidden
                className="size-2 rounded-[3px]"
                style={{ background: labelOf(failure.kind).color }}
              />
              {labelOf(failure.kind).short}
            </span>
            <span className="text-ink-soft">{failure.reason}</span>
            <span
              className={cn(
                "inline-flex h-6 items-center justify-self-start rounded-full px-2.5 text-[11px] font-bold",
                failure.retriedAt
                  ? "bg-mint text-mint-text"
                  : "bg-butter text-[#6b4e00]",
              )}
            >
              {failure.retriedAt
                ? `Retried ${shortDay(failure.retriedAt)}`
                : "Waiting for next open"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HealthCard({
  className,
  title,
  value,
  note,
}: {
  className: string;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-[18px] p-4", className)}>
      <span className="text-[13px] font-bold">{title}</span>
      <span className="font-serif text-[28px] text-ink">{value}</span>
      <span className="text-xs">{note}</span>
    </div>
  );
}
