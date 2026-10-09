// The mark is the product's question drawn as two bars: a short one of
// preparation over a longer one of execution.
export function Brand() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 20 16" className="h-4 w-5" aria-hidden>
        <rect width="11" height="6" rx="3" className="fill-preparation" />
        <rect y="10" width="20" height="6" rx="3" className="fill-execution" />
      </svg>
      <span className="font-semibold tracking-tight font-stretch-[112%]">
        FocusTrack
      </span>
    </span>
  );
}
