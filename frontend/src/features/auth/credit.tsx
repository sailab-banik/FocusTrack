const STEAM = [
  { d: "M7 7c-1-1.5 1-2.5 0-4", delay: "0ms" },
  { d: "M10 7c-1-1.5 1-2.5 0-4", delay: "500ms" },
  { d: "M13 7c-1-1.5 1-2.5 0-4", delay: "1000ms" },
];

export function Credit() {
  return (
    <footer className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
      <svg
        viewBox="0 0 20 20"
        className="size-5 overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        aria-hidden
      >
        {STEAM.map(({ d, delay }) => (
          <path
            key={d}
            d={d}
            className="motion-safe:animate-steam"
            style={{ animationDelay: delay }}
          />
        ))}
        <path d="M4 9h12v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
        <path d="M16 10.5h1a2 2 0 0 1 0 4h-1.3" />
      </svg>
      <span>Brewed by</span>
      <a
        href="https://portfolio.sailab.dev/"
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
      >
        Sailab Banik
      </a>
    </footer>
  );
}
