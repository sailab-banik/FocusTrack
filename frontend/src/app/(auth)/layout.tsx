import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2 px-1">
          <Brand />
          <p className="text-sm text-muted-foreground">
            Track work sessions and what each one produced.
          </p>
        </div>
        <div className="flex flex-col gap-5 rounded-3xl border bg-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
