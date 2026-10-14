"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { dismissGuide } from "./actions";

type Step = { title: string; detail: React.ReactNode; done?: boolean };

/**
 * Four lines on how the app works, beside the timer until the first session.
 * It never blocks starting one: the close button hides it for this visit, and
 * "Don't show again" for good on this device.
 */
export function FirstRunGuide({ hasProject }: { hasProject: boolean }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const steps: Step[] = [
    {
      title: "Add a project",
      detail: (
        <>
          Every session belongs to one. Add it on{" "}
          <GuideLink href="/work">Work</GuideLink>.
        </>
      ),
      done: hasProject,
    },
    {
      title: "Pick a category and press Start",
      detail:
        "Execution is making things; preparation is planning and learning.",
    },
    {
      title: "Stop and note what you produced",
      detail: "Output is what counts, not hours.",
    },
    {
      title: "Read your reports",
      detail: (
        <>
          Daily, weekly, and monthly reports appear on{" "}
          <GuideLink href="/review">Review</GuideLink> on their own.
        </>
      ),
    },
  ];

  return (
    <section
      aria-labelledby="guide-heading"
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="guide-heading" className="font-semibold tracking-tight">
          How FocusTrack works
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Hide for now"
          className="-my-1 -mr-1.5"
          onClick={() => setHidden(true)}
        >
          <X />
        </Button>
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums",
                step.done && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {step.done ? (
                <Check className="size-3" aria-label="Done" />
              ) : (
                index + 1
              )}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.done && "text-muted-foreground line-through",
                )}
              >
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <form action={dismissGuide} className="-mb-1 flex justify-end">
        <Button type="submit" variant="ghost" size="sm">
          Don&apos;t show again
        </Button>
      </form>
    </section>
  );
}

function GuideLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {children}
    </Link>
  );
}
