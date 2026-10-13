import Link from "next/link";
import { Suspense } from "react";
import { TabBar, TopNav } from "@/components/app-nav";
import { Brand } from "@/components/brand";
import { AccountMenu } from "@/features/auth/account-menu";
import { requireUser } from "@/features/auth/current-user";
import { DueReports } from "@/features/review/due-reports";
import { ReportNotifications } from "@/features/review/report-notifications";
import { getTimeZone } from "@/features/timezone/time-zone";
import { TimeZoneSync } from "@/features/timezone/time-zone-sync";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, timeZone] = await Promise.all([requireUser(), getTimeZone()]);

  return (
    <>
      <TimeZoneSync serverTimeZone={timeZone} />
      <DueReports />
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Brand />
          </Link>
          <TopNav />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* The placeholder holds the bell's place while its query runs. */}
          <Suspense fallback={<span className="size-9" />}>
            <ReportNotifications />
          </Suspense>
          <AccountMenu email={user.email} />
        </div>
      </header>
      {/* Bottom padding keeps content clear of the fixed tab bar on phones. */}
      <div className="flex flex-1 flex-col pb-20 md:pb-0">{children}</div>
      <TabBar />
    </>
  );
}
