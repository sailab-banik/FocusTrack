export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          FocusTrack
        </p>
        {children}
      </div>
    </main>
  );
}
