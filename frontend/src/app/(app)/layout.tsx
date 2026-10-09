import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/current-user";
import { getTimeZone } from "@/features/timezone/time-zone";
import { TimeZoneSync } from "@/features/timezone/time-zone-sync";

const NAV_LINKS = [
  { href: "/sessions", label: "History" },
  { href: "/goals", label: "Goals" },
  { href: "/projects", label: "Projects" },
  { href: "/categories", label: "Categories" },
] as const;

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, timeZone] = await Promise.all([requireUser(), getTimeZone()]);

  return (
    <>
      <TimeZoneSync serverTimeZone={timeZone} />
      <header className="flex items-center justify-between gap-4 border-b px-4 py-2">
        <nav className="flex min-w-0 items-center gap-4 overflow-x-auto text-sm">
          <Link href="/" className="shrink-0 font-semibold">
            FocusTrack
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:inline">
            {user.email}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}
