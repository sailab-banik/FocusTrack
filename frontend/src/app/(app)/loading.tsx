export default function AppLoading() {
  return (
    <main
      role="status"
      aria-label="Loading"
      className="mx-auto flex w-full max-w-5xl animate-pulse flex-col gap-8 px-4 py-8 motion-reduce:animate-none sm:py-12"
    >
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="flex flex-col gap-8">
          <div className="h-28 w-48 rounded-2xl bg-muted" />
          <div className="h-8 bg-muted" />
          <div className="h-14 rounded-xl bg-muted" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-6 rounded-lg bg-muted" />
          <div className="h-24 rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
