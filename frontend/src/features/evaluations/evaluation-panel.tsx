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
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-medium">AI evaluation</h2>
        <p className="text-xs text-muted-foreground">
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
        AI evaluation is off. Set <code>OPENAI_API_KEY</code> on the server to
        turn it on.
      </p>
    );
  }
  if (!logged) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a description and outcome below to get an evaluation.
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
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {DIMENSIONS.map((dimension) => (
          <div key={dimension.key} className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{dimension.label}</dt>
            <dd>
              <ScoreBar score={evaluation[dimension.key]} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-sm">{evaluation.rationale}</p>
      <p className="text-sm">
        <span className="font-medium">Next:</span> {evaluation.next_action}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {evaluation.model} · {evaluation.promptVersion}
        </p>
        <EvaluateButton sessionId={sessionId} label="Re-evaluate" />
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div
      className="flex items-center gap-2"
      aria-label={`${score} out of 5`}
    >
      <div className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={
              step <= score
                ? "h-2 w-4 rounded-sm bg-foreground"
                : "h-2 w-4 rounded-sm bg-muted"
            }
          />
        ))}
      </div>
      <span className="text-xs tabular-nums">{score}/5</span>
    </div>
  );
}
