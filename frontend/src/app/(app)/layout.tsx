import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/current-user";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b px-4 py-2">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold">
            FocusTrack
          </Link>
          <Link
            href="/projects"
            className="text-muted-foreground hover:text-foreground"
          >
            Projects
          </Link>
          <Link
            href="/categories"
            className="text-muted-foreground hover:text-foreground"
          >
            Categories
          </Link>
        </nav>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm text-muted-foreground">
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
