import { EvaluateButton } from "./evaluate-button";
import type { StoredEvaluation } from "./queries";
import { DIMENSIONS } from "./schema";

export function EvaluationPanel({
  sessionId,
  evaluation,
  aiConfigured,
  logged,
}: {
  sessionId: string;
  evaluation: StoredEvaluation | null;
  aiConfigured: boolean;
  logged: boolean;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">AI evaluation</h2>
        <p className="text-sm text-muted-foreground">
          AI-assisted estimates, not objective measurements.
        </p>
      </div>
      <PanelBody
        sessionId={sessionId}
        evaluation={evaluation}
        aiConfigured={aiConfigured}
        logged={logged}
      />
    </section>
  );
}

function PanelBody({
  sessionId,
  evaluation,
  aiConfigured,
  logged,
}: {
  sessionId: string;
  evaluation: StoredEvaluation | null;
  aiConfigured: boolean;
  logged: boolean;
}) {
  if (!aiConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        AI evaluation is off. Set{" "}
        <code className="rounded-sm bg-muted px-1 py-0.5 text-xs text-foreground">
          OPENAI_API_KEY
        </code>{" "}
        on the server to turn it on.
      </p>
    );
  }
  if (!logged) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a description and outcome to get an evaluation.
      </p>
    );
  }
  if (!evaluation) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Not evaluated yet. Evaluations usually arrive a few seconds after a
          session is saved; reload to check, or run one now.
        </p>
        <EvaluateButton sessionId={sessionId} label="Evaluate now" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col gap-2.5">
        {DIMENSIONS.map((dimension) => (
          <div
            key={dimension.key}
            className="flex items-center justify-between gap-4"
          >
            <dt className="text-sm text-muted-foreground">{dimension.label}</dt>
            <dd>
              <ScoreBar score={evaluation[dimension.key]} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-sm leading-relaxed">{evaluation.rationale}</p>
      <p className="rounded-xl bg-muted p-3.5 text-sm leading-relaxed">
        <span className="font-semibold">Next:</span> {evaluation.next_action}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span>{evaluation.model}</span>
          <span>{evaluation.promptVersion}</span>
        </p>
        <EvaluateButton sessionId={sessionId} label="Re-evaluate" />
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div
      className="flex items-center gap-2.5"
      aria-label={`${score} out of 5`}
    >
      <div className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={
              step <= score
                ? "h-2 w-5 rounded-full bg-foreground"
                : "h-2 w-5 rounded-full bg-border"
            }
          />
        ))}
      </div>
      <span className="w-6 text-right text-sm font-medium tabular-nums">
        {score}/5
      </span>
    </div>
  );
}
