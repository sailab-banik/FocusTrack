export const LOG_LIMITS = { description: 500, outcome: 500, notes: 2000 };

export type LogFields = {
  description: string;
  outcome: string;
  energy: number | null;
  difficulty: number | null;
  notes: string | null;
};

export type SessionLog = LogFields & { stoppedAt: Date };

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export type SessionLogResult =
  | { ok: true; log: SessionLog }
  | { ok: false; error: string };

export function parseSessionLog(formData: FormData): SessionLogResult {
  const fields = parseLogFields(formData);
  if (!fields.ok) return fields;

  const stoppedAtRaw = formData.get("stoppedAt");
  const stoppedAt =
    typeof stoppedAtRaw === "string" ? new Date(stoppedAtRaw) : null;
  if (stoppedAt === null || Number.isNaN(stoppedAt.getTime())) {
    return { ok: false, error: "Missing stop time. Stop the session again." };
  }

  return { ok: true, log: { ...fields.value, stoppedAt } };
}

export function parseLogFields(formData: FormData): Result<LogFields> {
  const description = requiredText(formData, "description");
  if (description === null) {
    return { ok: false, error: "Describe what you worked on." };
  }
  if (description.length > LOG_LIMITS.description) {
    return { ok: false, error: tooLong("Description", LOG_LIMITS.description) };
  }

  const outcome = requiredText(formData, "outcome");
  if (outcome === null) {
    return { ok: false, error: "Describe the outcome: what was produced." };
  }
  if (outcome.length > LOG_LIMITS.outcome) {
    return { ok: false, error: tooLong("Outcome", LOG_LIMITS.outcome) };
  }

  const energy = parseRating(formData.get("energy"));
  const difficulty = parseRating(formData.get("difficulty"));
  if (energy === undefined || difficulty === undefined) {
    return { ok: false, error: "Ratings must be between 1 and 5." };
  }

  const notes = requiredText(formData, "notes");
  if (notes !== null && notes.length > LOG_LIMITS.notes) {
    return { ok: false, error: tooLong("Notes", LOG_LIMITS.notes) };
  }

  return {
    ok: true,
    value: { description, outcome, energy, difficulty, notes },
  };
}

// A session stopped while paused ended when the pause began. Otherwise the
// stop time comes from the client, so it is capped at the server's clock.
export function resolveEndedAt(
  stoppedAt: Date,
  now: Date,
  pausedAt: Date | null,
): Date {
  if (pausedAt) return pausedAt;
  return stoppedAt < now ? stoppedAt : now;
}

function requiredText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// null means "not rated"; undefined means invalid.
function parseRating(value: FormDataEntryValue | null): number | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !/^[1-5]$/.test(value)) return undefined;
  return Number(value);
}

function tooLong(field: string, limit: number): string {
  return `${field} must be ${limit} characters or fewer.`;
}
