export default function AppLoading() {
  return (
    <main
      role="status"
      aria-label="Loading"
      className="flex w-full max-w-[1160px] animate-pulse flex-col gap-6 px-4 py-4 motion-reduce:animate-none md:px-2 md:pt-[18px] md:pr-7"
    >
      <div className="h-40 rounded-[28px] bg-wash" />
      <div className="h-64 rounded-3xl bg-wash" />
      <div className="h-32 rounded-3xl bg-wash" />
    </main>
  );
}
