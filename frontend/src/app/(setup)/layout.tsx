import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/current-user";
import { DayColumn } from "@/features/onboarding/day-column";
import { SunriseShell } from "@/features/onboarding/sunrise-shell";

export default async function SetupLayout({ children }: LayoutProps<"/">) {
  await requireUser();

  return (
    <SunriseShell>
      {/* There is no app nav yet, so this is the one way out. */}
      <form action={signOut} className="absolute top-[18px] right-5 z-3 lg:top-7 lg:right-10">
        <button
          type="submit"
          className="h-10 cursor-pointer rounded-full bg-white/60 px-3.5 text-sm font-semibold text-ink lg:bg-transparent lg:text-ink-soft"
        >
          Log out
        </button>
      </form>
      <DayColumn>{children}</DayColumn>
    </SunriseShell>
  );
}
