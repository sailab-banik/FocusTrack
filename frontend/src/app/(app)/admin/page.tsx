import type { Metadata } from "next";
import { requireAdmin } from "@/features/admin/access";
import { AdminOverview } from "@/features/admin/admin-overview";
import { buildOverview, RANGES, type Range } from "@/features/admin/overview";
import { loadAdminData } from "@/features/admin/queries";
import { loadVisitors } from "@/features/admin/visitors";
import { getAiProvider } from "@/features/ai/get-provider";

export const metadata: Metadata = { title: "Admin · FocusTrack" };

export default async function AdminPage() {
  await requireAdmin();
  const now = new Date();
  const [data, visitors] = await Promise.all([
    loadAdminData(now, Math.max(...RANGES)),
    loadVisitors(now),
  ]);
  const input = { ...data, now };

  return (
    <main className="flex w-full max-w-[1180px] flex-col px-4 pt-1 pb-8 md:pt-[26px] md:pr-7 md:pb-16 md:pl-2">
      <AdminOverview
        overviews={
          Object.fromEntries(
            RANGES.map((range) => [range, buildOverview(range, input)]),
          ) as Record<Range, ReturnType<typeof buildOverview>>
        }
        visitors={visitors}
        model={getAiProvider()?.model ?? null}
        today={now.toLocaleDateString("en-US", {
          timeZone: "UTC",
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />
    </main>
  );
}
