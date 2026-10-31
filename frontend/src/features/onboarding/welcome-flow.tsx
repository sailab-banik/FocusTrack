"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SIGN_IN_PATH, SIGN_UP_PATH } from "@/features/auth/routes";
import { useTour } from "./sunrise-shell";
import { StepProgress } from "./step-progress";
import { TOUR_PAGES } from "./tour-pages";

export function WelcomeFlow() {
  const { page } = useTour();
  return page === null ? <Cover /> : <TourPage page={page} />;
}

function Cover() {
  const { goTo } = useTour();
  return (
    <>
      <Link
        href={SIGN_IN_PATH}
        className="absolute top-7 right-10 z-3 hidden h-10 items-center rounded-full bg-white/16 px-4 text-sm font-semibold text-white lg:flex"
      >
        Log in
      </Link>
      <main className="relative z-2 flex min-h-dvh flex-col justify-end pt-[45dvh] lg:justify-center lg:pt-0 lg:pl-[8.3%]">
        <div className="ft-cover-sheet flex min-h-[374px] flex-col gap-3 rounded-t-[32px] bg-mist px-6 pt-[30px] pb-6 lg:min-h-0 lg:max-w-[640px] lg:gap-5 lg:rounded-none lg:bg-transparent lg:p-0 lg:text-white">
          <h1
            className="ft-in font-serif text-[40px] leading-[46px] tracking-[-0.01em] lg:text-[76px] lg:leading-[82px] lg:tracking-[-0.015em]"
            style={{ animationDelay: "900ms" }}
          >
            Hours aren’t output.
          </h1>
          <p
            className="ft-in max-w-[520px] text-base text-pretty text-ink-soft lg:text-xl lg:leading-[30px] lg:text-[#f3eeff]"
            style={{ animationDelay: "1050ms" }}
          >
            See how much of your time goes to making things, how much to getting
            ready, and what it all added up to.
          </p>
          <div
            className="ft-in mt-auto flex flex-col gap-2 pt-4 lg:mt-3 lg:flex-row lg:gap-3 lg:pt-0"
            style={{ animationDelay: "1200ms" }}
          >
            <button
              type="button"
              onClick={() => goTo(0, "forward")}
              className="flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-indigo text-base font-semibold text-white shadow-[0_10px_24px_rgb(46_42_120/.28)] lg:h-[58px] lg:rounded-[18px] lg:bg-white lg:px-7 lg:text-[17px] lg:font-bold lg:text-indigo lg:shadow-[0_14px_32px_rgb(20_16_60/.3)]"
            >
              Show me how it works
              <ArrowRight className="hidden size-4 lg:block" aria-hidden />
            </button>
            <Link
              href={SIGN_IN_PATH}
              className="flex h-[52px] items-center justify-center rounded-2xl text-[15px] font-semibold text-indigo lg:h-[58px] lg:rounded-[18px] lg:border-[1.5px] lg:border-white/50 lg:px-[22px] lg:text-base lg:text-white"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function TourPage({ page }: { page: number }) {
  const { direction, goTo } = useTour();
  const { title, body, Scene } = TOUR_PAGES[page];
  const isLast = page === TOUR_PAGES.length - 1;
  const enter = direction === "forward" ? "ft-in" : "ft-in-back";

  return (
    <>
      <div className="absolute top-[18px] right-5 z-3 flex gap-2 lg:top-7 lg:right-10">
        <Link
          href={SIGN_UP_PATH}
          className="flex h-10 items-center rounded-full bg-white/60 px-3.5 text-sm font-semibold text-ink lg:bg-transparent lg:px-4 lg:text-ink-soft"
        >
          <span className="lg:hidden">Skip</span>
          <span className="hidden lg:inline">Skip the tour</span>
        </Link>
        <Link
          href={SIGN_IN_PATH}
          className="hidden h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-indigo lg:flex"
        >
          Log in
        </Link>
      </div>

      {/* On phones the right column dissolves so the scene can sit between the
          progress bar and the text. */}
      <main className="relative z-2 flex min-h-dvh flex-col px-6 pt-[70px] pb-6 lg:grid lg:grid-cols-[52.8%_1fr] lg:items-center lg:p-0">
        <div
          aria-hidden
          className="order-2 mx-auto h-[312px] lg:order-none w-[min(342px,100%)] overflow-hidden rounded-[26px] bg-paper shadow-[0_1px_2px_rgb(31_27_61/.06),0_24px_50px_rgb(46_42_120/.16)] lg:w-[342px] lg:scale-[1.35]"
        >
          <div key={page} className="ft-stage relative size-full">
            <Scene />
          </div>
        </div>

        <div className="contents lg:flex lg:max-w-[460px] lg:flex-col lg:justify-center lg:px-10 xl:px-0 xl:pl-[100px] xl:box-content">
          <StepProgress
            label="Tour progress"
            total={TOUR_PAGES.length}
            current={page}
            animate={direction === "forward"}
            className="order-1 mb-[38px] w-40 lg:mb-9 lg:w-[180px]"
          />
          <div
            key={page}
            className={`${enter} order-3 mt-7 flex flex-col gap-2.5 lg:mt-0 lg:gap-[18px]`}
            style={{ animationDelay: "120ms" }}
          >
            <h1 className="font-serif text-[28px] leading-[34px] text-balance lg:text-[46px] lg:leading-[54px]">
              {title}
            </h1>
            <p className="text-base text-pretty text-ink-soft lg:text-[19px] lg:leading-[29px]">
              {body}
            </p>
          </div>
          <div className="order-4 mt-auto flex gap-2.5 pt-6 lg:mt-10 lg:pt-0">
            <button
              type="button"
              aria-label="Back"
              onClick={() => goTo(page === 0 ? null : page - 1, "back")}
              className="flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-paper shadow-[0_1px_2px_rgb(31_27_61/.06),0_6px_16px_rgb(46_42_120/.08)]"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            {isLast ? (
              <Link href={SIGN_UP_PATH} className={NEXT_CLASS}>
                Make it mine
                <ArrowRight className="hidden size-4 lg:block" aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => goTo(page + 1, "forward")}
                className={NEXT_CLASS}
              >
                Next
                <ArrowRight className="hidden size-4 lg:block" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

const NEXT_CLASS =
  "flex h-14 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-indigo text-base font-semibold text-white shadow-[0_10px_24px_rgb(46_42_120/.25)] lg:flex-none lg:px-7";
