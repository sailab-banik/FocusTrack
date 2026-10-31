import { Play, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  AdminLink,
  SettingsLink,
  SidebarNav,
  TabBar,
} from "@/components/app-nav";
import { Brand } from "@/components/brand";
import { isAdminEmail } from "@/features/admin/access";
import { requireUser } from "@/features/auth/current-user";
import { ProjectTile } from "@/features/projects/project-tile";
import { listProjects } from "@/features/projects/queries";
import { DueReports } from "@/features/review/due-reports";
import { ReportNotifications } from "@/features/review/report-notifications";
import { getTimeZone } from "@/features/timezone/time-zone";
import { TimeZoneSync } from "@/features/timezone/time-zone-sync";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, timeZone, projects] = await Promise.all([
    requireUser(),
    getTimeZone(),
    listProjects(),
  ]);

  return (
    <>
      <TimeZoneSync serverTimeZone={timeZone} />
      <DueReports />
      <div className="flex flex-1 md:grid md:grid-cols-[236px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh flex-col gap-1 overflow-y-auto px-3.5 py-[18px] md:flex">
          <div className="flex h-10 items-center justify-between pr-1 pl-2">
            <Link href="/" className="rounded-md">
              <Brand />
            </Link>
            <Suspense fallback={<span className="size-9" />}>
              <ReportNotifications />
            </Suspense>
          </div>
          <Link
            href="/"
            className="mt-3.5 mb-[18px] flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo text-sm font-semibold text-white shadow-[0_6px_16px_rgb(46_42_120/.22)]"
          >
            <Play aria-hidden className="size-3 fill-current" />
            Start a session
          </Link>
          <SidebarNav />
          {projects.some((p) => !p.archived) && (
            <>
              <span className="mt-6 mb-1.5 px-3 text-xs font-semibold text-ink-muted">
                Projects
              </span>
              {projects
                .filter((p) => !p.archived)
                .map((project) => (
                  <Link
                    key={project.id}
                    href="/projects"
                    className="flex h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-3 text-[13px] text-ink-soft hover:bg-wash"
                  >
                    <ProjectTile id={project.id} name={project.name} size="xs" />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))}
            </>
          )}
          <div className="mt-auto flex flex-col gap-1.5 pt-6">
            {isAdminEmail(user.email) && <AdminLink />}
            <SettingsLink />
          </div>
        </aside>
        {/* Bottom padding keeps content clear of the floating tab bar. */}
        <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
          <header className="relative z-20 flex h-16 shrink-0 items-center justify-between px-5 md:hidden">
            <Link href="/" className="rounded-md">
              <Brand showName={false} />
            </Link>
            <div className="flex items-center gap-1 rounded-[14px] bg-white/60">
              <Suspense fallback={<span className="size-9" />}>
                <ReportNotifications />
              </Suspense>
              <Link
                href="/settings"
                aria-label="Settings"
                className="flex size-11 items-center justify-center rounded-[14px] text-ink"
              >
                <SlidersHorizontal aria-hidden className="size-5" />
              </Link>
            </div>
          </header>
          {children}
        </div>
      </div>
      <TabBar />
    </>
  );
}
