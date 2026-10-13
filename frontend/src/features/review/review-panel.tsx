import { dayLabel } from "@/features/sessions/history";
import { formatLocalTime, localDayKey } from "@/features/timezone/zoned-time";
import type { StoredReview } from "./queries";
import { ReviewButton } from "./review-button";

const WHAT_IS_SENT =
  "Sends this week's totals, your goal and project names, and session outcomes to the AI provider. Notes and descriptions stay here.";

export function ReviewPanel({
  review,
  aiConfigured,
  hasSessions,
  now,
  timeZone,
}: {
  review: StoredReview | null;
  aiConfigured: boolean;
  hasSessions: boolean;
  now: Date;
  timeZone: string;
}) {
  if (!review && !aiConfigured) {
    return (
      <p className="max-w-prose text-muted-foreground">
        The AI review is off. Set{" "}
        <code className="rounded-sm bg-muted px-1 py-0.5 text-sm text-foreground">
          OPENAI_API_KEY
        </code>{" "}
        on the server to turn it on. The numbers above work without it.
      </p>
    );
  }
  if (!review) {
    return (
      <div className="flex flex-col gap-4">
        <p className="max-w-prose text-muted-foreground">
          {hasSessions
            ? "Get a critical read of this week against the four before it: where the time went, what it produced, and what to change."
            : "Finish a session this week, then ask for a review."}
        </p>
        {hasSessions && (
          <>
            <ReviewButton label="Review this week" variant="default" />
            <p className="max-w-prose text-xs text-muted-foreground">
              {WHAT_IS_SENT}
            </p>
          </>
        )}
      </div>
    );
  }

  const writtenAt = new Date(review.createdAt);
  const day = dayLabel(localDayKey(writtenAt, timeZone), now, timeZone);
  const writtenOn =
    day === "Today" || day === "Yesterday" ? day.toLowerCase() : `on ${day}`;
  return (
    <article className="flex flex-col gap-6">
      <p className="max-w-prose text-2xl leading-snug font-semibold tracking-tight text-balance font-stretch-[108%]">
        {review.headline}
      </p>
      <ul className="flex flex-col divide-y border-y">
        {review.observations.map((observation) => (
          <li key={observation.title} className="flex flex-col gap-1 py-4">
            <h3 className="font-semibold">{observation.title}</h3>
            <p className="max-w-prose text-muted-foreground">
              {observation.evidence}
            </p>
          </li>
        ))}
      </ul>
      <p className="max-w-prose border-l-2 border-foreground pl-4">
        <span className="font-semibold">Next: </span>
        {review.nextAction}
      </p>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          An AI-assisted read, not an objective measurement. Written{" "}
          {writtenOn} at {formatLocalTime(writtenAt, timeZone)} by{" "}
          {review.model}.
        </p>
        {aiConfigured && <ReviewButton label="Review again" variant="outline" />}
      </div>
    </article>
  );
}
