"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markReportsSeen } from "./actions";
import type { PeriodKind } from "./periods";

export type BellNotice = {
  kind: PeriodKind;
  title: string;
  period: string;
  unread: boolean;
};

const REVIEW_PATH = "/review";

export function ReportBell({ notices }: { notices: BellNotice[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const unread = notices.filter((notice) => notice.unread).length;
  // Opening the list, or being on the page the reports are on, is seeing them.
  const seeing = open || pathname === REVIEW_PATH;

  useEffect(() => {
    if (unread > 0 && seeing) void markReportsSeen();
  }, [unread, seeing]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={
          unread > 0 ? `Notifications, ${unread} new` : "Notifications"
        }
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-lg" }),
          "relative rounded-full",
        )}
      >
        <Bell />
        {unread > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-1 p-2">
        <PopoverTitle className="px-2 py-1.5">Notifications</PopoverTitle>
        {notices.length === 0 ? (
          <p className="px-2 pb-2 text-muted-foreground">
            Nothing new. A new report shows up here for a week.
          </p>
        ) : (
          <ul className="flex flex-col">
            {notices.map((notice) => (
              <li key={notice.kind}>
                <Link
                  href={`${REVIEW_PATH}?report=${notice.kind}`}
                  onClick={() => setOpen(false)}
                  className="flex flex-col rounded-md px-2 py-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="font-medium">{notice.title} is ready</span>
                  <span className="text-muted-foreground">{notice.period}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
