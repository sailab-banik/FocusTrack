"use client";

import {
  ChartNoAxesColumn,
  LayoutGrid,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

// Each tab has its own color when active, as in the design.
const NAV_ITEMS = [
  { href: "/", label: "Today", icon: Sun, activeIcon: "text-tangerine" },
  { href: "/log", label: "Log", icon: ScrollText, activeIcon: "text-periwinkle" },
  { href: "/projects", label: "Projects", icon: LayoutGrid, activeIcon: "text-indigo" },
  { href: "/insights", label: "Insights", icon: ChartNoAxesColumn, activeIcon: "text-tangerine" },
] as const;

function isCurrent(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-sm",
              current
                ? "bg-paper font-semibold shadow-[0_1px_2px_rgb(31_27_61/.06),0_4px_12px_rgb(46_42_120/.06)]"
                : "font-medium text-ink-soft hover:bg-wash",
            )}
          >
            <item.icon
              aria-hidden
              className={cn("size-[18px]", current && item.activeIcon)}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function FooterLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof ShieldCheck;
}) {
  const current = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex h-[38px] items-center gap-3 rounded-xl px-3 text-sm",
        current
          ? "bg-paper font-semibold shadow-[0_1px_2px_rgb(31_27_61/.06),0_4px_12px_rgb(46_42_120/.06)]"
          : "font-medium text-ink-soft hover:bg-wash",
      )}
    >
      <Icon
        aria-hidden
        className={cn("size-[18px]", current && "text-indigo")}
      />
      {label}
    </Link>
  );
}

export function SettingsLink() {
  return <FooterLink href="/settings" label="Settings" icon={SlidersHorizontal} />;
}

export function AdminLink() {
  return <FooterLink href="/admin" label="Admin" icon={ShieldCheck} />;
}

// Phones get thumb-reach tabs: starting or stopping a session is one tap away
// from any page.
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-[calc(14px+env(safe-area-inset-bottom))] z-20 grid h-[66px] grid-cols-4 gap-1 rounded-[22px] bg-paper p-1.5 shadow-[0_1px_2px_rgb(31_27_61/.06),0_12px_32px_rgb(46_42_120/.14)] md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-[3px] rounded-2xl text-[11px]",
              current
                ? "bg-wash font-bold text-indigo"
                : "font-semibold text-ink-muted",
            )}
          >
            <item.icon
              aria-hidden
              className={cn("size-5", current && item.activeIcon)}
            />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
