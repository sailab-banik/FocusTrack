import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { isAdminEmail } from "@/features/admin/access";
import { getAiProvider } from "@/features/ai/get-provider";
import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/current-user";
import { PRIVACY_PATH, RESET_PASSWORD_PATH } from "@/features/auth/routes";
import { CategoryBoard } from "@/features/categories/category-board";
import {
  countSessionsByCategory,
  listCategories,
} from "@/features/categories/queries";
import { InstallCard } from "@/features/install/install-card";
import { ProfileForm } from "@/features/settings/profile-card";
import { SectionNav } from "@/features/settings/section-nav";
import { getTimeZone } from "@/features/timezone/time-zone";

export const metadata: Metadata = { title: "Settings · FocusTrack" };

const CARD =
  "ft-in flex scroll-mt-6 flex-col rounded-3xl bg-paper p-5 shadow-[0_1px_2px_rgb(31_27_61/.05),0_8px_24px_rgb(46_42_120/.06)] md:p-[26px]";
const HEADING = "font-serif text-2xl";
const ROW =
  "flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-t border-line-soft py-2";

export default async function SettingsPage() {
  const [user, categories, timeZone] = await Promise.all([
    requireUser(),
    listCategories(),
    getTimeZone(),
  ]);
  const sessionCounts = await countSessionsByCategory(categories);
  const provider = getAiProvider();

  return (
    <main className="flex w-full max-w-[1100px] flex-col gap-7 px-4 pt-1 pb-8 md:pt-[26px] md:pr-7 md:pb-16 md:pl-2">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-serif text-[34px] leading-10 md:text-[40px] md:leading-[46px]">
          Settings
        </h1>
        <p className="text-[15px] text-ink-soft">
          How FocusTrack counts your time, and your account.
        </p>
      </div>

      <div className="flex items-start gap-7">
        <SectionNav />
        <div className="flex max-w-[780px] min-w-0 flex-1 flex-col gap-[22px]">
          <section
            id="profile"
            aria-labelledby="settings-profile"
            className={`${CARD} gap-[18px]`}
          >
            <h2 id="settings-profile" className={HEADING}>
              Profile
            </h2>
            <ProfileForm name={user.name} email={user.email} />
          </section>

          <section
            id="categories"
            aria-labelledby="settings-categories"
            className={`${CARD} gap-4`}
          >
            <div className="flex flex-col gap-1">
              <h2 id="settings-categories" className={HEADING}>
                Categories
              </h2>
              <p className="text-sm leading-[21px] text-ink-soft">
                Your execution share, reports and nudges all come from this
                split. Tap a category to move it.
              </p>
            </div>
            <CategoryBoard
              categories={categories}
              sessionCounts={sessionCounts}
            />
          </section>

          <section
            id="reports"
            aria-labelledby="settings-reports"
            className={`${CARD} relative gap-4 overflow-hidden`}
          >
            <NightCard />
            <div className="flex flex-col gap-1 sm:max-w-[480px] sm:pr-32 md:pr-0">
              <h2 id="settings-reports" className={HEADING}>
                Reports and AI
              </h2>
              <p className="text-sm leading-[21px] text-ink-soft">
                A read of your own numbers after each day, week and month,
                written the first time you open FocusTrack once the period
                ends.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {provider ? (
                <>
                  <Chip className="bg-mint font-bold text-mint-text">
                    <Check aria-hidden className="size-3" />
                    On
                  </Chip>
                  <Chip className="bg-wash">
                    <span className="capitalize">{provider.name}</span> ·{" "}
                    {provider.model}
                  </Chip>
                  <Chip className="bg-wash">Daily · Weekly · Monthly</Chip>
                </>
              ) : (
                <Chip className="bg-butter font-bold text-[#6b4e00]">Off</Chip>
              )}
            </div>
            <div className="flex flex-wrap gap-3.5">
              <FactList
                title="What the model sees"
                facts={[
                  "Totals and the execution split",
                  "Project names and their goals",
                  "Session times and comments",
                ]}
                positive
              />
              <FactList
                title="Never sent"
                facts={[
                  "Your email or account details",
                  "Anything outside the period",
                ]}
                positive={false}
              />
            </div>
            <p className="text-[13px] text-ink-muted">
              Everything else in FocusTrack works the same with AI off.{" "}
              <Link href={PRIVACY_PATH} className="font-semibold text-indigo">
                Read the privacy page
              </Link>
              .
            </p>
          </section>

          <section
            id="time"
            aria-labelledby="settings-time"
            className={`${CARD} gap-1.5`}
          >
            <h2 id="settings-time" className={`${HEADING} mb-2.5`}>
              Time and days
            </h2>
            <div className={ROW}>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">Time zone</span>
                <span className="text-[13px] text-ink-muted">
                  Decides where your days and weeks begin.
                </span>
              </span>
              <span className="text-sm font-semibold text-ink-soft sm:text-right">
                {timeZone.replaceAll("_", " ")}
                <span className="block text-xs font-medium text-ink-muted">
                  Automatic, from this browser
                </span>
              </span>
            </div>
            <div className={ROW}>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">
                  Weeks start on
                </span>
                <span className="text-[13px] text-ink-muted">
                  Weekly reads cover Monday to Sunday.
                </span>
              </span>
              <span className="text-sm font-semibold text-ink-soft">
                Monday
              </span>
            </div>
          </section>

          <InstallCard />

          <section
            id="account"
            aria-labelledby="settings-account"
            className={`${CARD} gap-1.5`}
          >
            <h2 id="settings-account" className={`${HEADING} mb-2.5`}>
              Account
            </h2>
            <div className={ROW}>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">Email</span>
                <span className="text-[13px] break-all text-ink-muted">
                  {user.email}
                </span>
              </span>
            </div>
            {isAdminEmail(user.email) && (
              <div className={`${ROW} lg:hidden`}>
                <span className="text-[15px] font-semibold">Admin</span>
                <Link
                  href="/admin"
                  className="flex h-11 items-center rounded-xl bg-wash px-3.5 text-sm font-semibold text-indigo"
                >
                  Open overview
                </Link>
              </div>
            )}
            <div className={ROW}>
              <span className="text-[15px] font-semibold">Password</span>
              <Link
                href={RESET_PASSWORD_PATH}
                className="flex h-11 items-center rounded-xl bg-wash px-3.5 text-sm font-semibold text-indigo"
              >
                Change password
              </Link>
            </div>
            <div className={ROW}>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">Sign out</span>
                <span className="text-[13px] text-ink-muted">
                  On this device only. A running session keeps running.
                </span>
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="h-11 cursor-pointer rounded-xl border-[1.5px] border-line bg-paper px-3.5 text-sm font-semibold"
                >
                  Sign out
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Chip({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex min-h-[34px] items-center gap-[7px] rounded-full px-3 text-[13px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function FactList({
  title,
  facts,
  positive,
}: {
  title: string;
  facts: string[];
  positive: boolean;
}) {
  return (
    <div className="flex flex-[1_1_260px] flex-col gap-2.5 rounded-[18px] bg-mist p-4">
      <span className="text-[13px] font-bold">{title}</span>
      {facts.map((fact) => (
        <span key={fact} className="flex items-center gap-2 text-sm">
          {positive ? (
            <Check aria-hidden className="size-3.5 shrink-0 text-[#1e8a5a]" />
          ) : (
            <X aria-hidden className="size-3.5 shrink-0 text-destructive" />
          )}
          {fact}
        </span>
      ))}
    </div>
  );
}

function NightCard() {
  return (
    <div
      aria-hidden
      className="absolute top-5 right-[22px] hidden h-[84px] w-[120px] overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#2e2a78,#4b4fc9)] sm:block"
    >
      <svg viewBox="0 0 120 84" className="absolute inset-0">
        <circle cx="74" cy="34" r="16" fill="#FFEFB8" />
        <circle cx="82" cy="28" r="15" fill="#3A35A0" />
        <path d="M0 68 C30 58 70 66 120 60 V84 H0 Z" fill="#232062" />
      </svg>
    </div>
  );
}
