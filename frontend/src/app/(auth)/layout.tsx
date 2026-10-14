import { Brand } from "@/components/brand";
import { Credit } from "@/features/auth/credit";
import { WeekIllustration } from "@/features/auth/week-illustration";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <main className="flex flex-col px-4 py-6 sm:px-10 sm:py-8">
        <Brand />
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
            {children}
          </div>
        </div>
        <Credit />
      </main>
      {/* Phones go straight to the form. */}
      <aside className="hidden items-center justify-center border-l bg-card px-12 py-12 lg:flex">
        <WeekIllustration />
      </aside>
    </div>
  );
}
