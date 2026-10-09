"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, History, Shapes, Target, Timer } from "lucide-react";
import { cn } from "cn";

const NAV_ITEMS = [
  { href: "/", label: "Timer", icon: Timer },
  { href: "/sessions", label: "History", icon: History },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/categories", label: "Categories", icon: Shapes },
] as const;

function isCurrent(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              current
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Phones get thumb-reach tabs: starting or stopping a session is one tap away
// from any page.
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-background/90 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "group flex min-w-0 flex-col items-center gap-1 py-2 text-[0.6875rem] outline-none",
              current ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                current && "bg-secondary",
              )}
            >
              <item.icon className="size-5" strokeWidth={current ? 2.25 : 1.75} />
            </span>
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
