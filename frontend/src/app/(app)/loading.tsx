export default function AppLoading() {
  return (
    <main
      role="status"
      aria-label="Loading"
      className="mx-auto flex w-full max-w-lg flex-1 animate-pulse flex-col justify-center gap-8 px-4 py-8 motion-reduce:animate-none"
    >
      <div className="h-28 w-48 rounded-2xl bg-muted" />
      <div className="h-8 bg-muted" />
      <div className="h-14 rounded-xl bg-muted" />
    </main>
  );
}
