import { formatDuration } from "./duration";

/** Execution then preparation. Empty until there is time to split. */
export function SplitBar({
  execution,
  preparation,
  className,
}: {
  execution: number;
  preparation: number;
  className?: string;
}) {
  const total = execution + preparation;
  return (
    <div
      role="img"
      aria-label={`${formatDuration(execution)} execution, ${formatDuration(preparation)} preparation`}
      className={`flex gap-[3px] ${className ?? "h-3"}`}
    >
      {total === 0 ? (
        <span className="flex-1 rounded-full bg-wash" />
      ) : (
        <>
          {execution > 0 && (
            <span
              className="ft-grow rounded-full bg-tangerine"
              style={{ width: `${(execution / total) * 100}%` }}
            />
          )}
          {preparation > 0 && (
            <span className="flex-1 rounded-full bg-periwinkle" />
          )}
        </>
      )}
    </div>
  );
}
