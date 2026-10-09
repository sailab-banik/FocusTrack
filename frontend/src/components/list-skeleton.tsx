export function ListSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none"
    >
      <div className="h-10 rounded-lg bg-muted" />
      <div className="h-24 rounded-2xl bg-muted" />
      <div className="h-24 rounded-2xl bg-muted" />
    </div>
  );
}
