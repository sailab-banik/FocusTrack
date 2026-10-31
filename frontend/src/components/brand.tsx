// A sun coming up over the horizon, in the colors of the sunrise.
export function Brand({ showName = true }: { showName?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-semibold">
      <svg viewBox="0 0 26 26" className="size-[26px]" aria-hidden>
        <rect width="26" height="26" rx="8" fill="#2E2A78" />
        <circle cx="13" cy="15" r="5" fill="#FFD9C2" />
        <rect x="6" y="18" width="14" height="3" rx="1.5" fill="#E8742A" />
      </svg>
      <span className={showName ? undefined : "sr-only"}>FocusTrack</span>
    </span>
  );
}
