import { formatDuration } from "./duration";

export type SkyPhase = "morning" | "afternoon" | "evening";

const NOON = 720;
const FIVE_PM = 1020;
const FIVE_AM = 300;

/** The small hours still read as last night's sky. */
export function skyPhase(minutesIntoDay: number): SkyPhase {
  if (minutesIntoDay < FIVE_AM || minutesIntoDay >= FIVE_PM) return "evening";
  return minutesIntoDay < NOON ? "morning" : "afternoon";
}

/** Where the sun sits in the Today sky, 6 am to 10 pm, in percent. */
export function sunPosition(minutesIntoDay: number): { x: number; y: number } {
  const progress = Math.min(1, Math.max(0, (minutesIntoDay - 360) / 960));
  return {
    x: 8 + progress * 84,
    y: 78 - Math.sin(progress * Math.PI) * 52,
  };
}

export function greeting(minutesIntoDay: number, firstName: string): string {
  const part = skyPhase(minutesIntoDay);
  return firstName ? `Good ${part}, ${firstName}.` : `Good ${part}.`;
}

/** One honest line about the day so far. */
export function dayLine(execution: number, preparation: number): string {
  const total = execution + preparation;
  if (total === 0) return "Nothing tracked yet today.";
  const tracked = `${formatDuration(total)} tracked so far`;
  if (preparation === 0) return `${tracked}, all of it execution.`;
  if (execution === 0) return `${tracked}, all of it preparation.`;
  return `${tracked}, ${formatDuration(execution)} of it execution.`;
}
