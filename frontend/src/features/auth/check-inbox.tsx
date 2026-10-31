"use client";

import { useActionState } from "react";
import { resendConfirmation, type AuthFormState } from "./actions";
import { AuthHeading } from "./auth-heading";

const initialState: AuthFormState = { status: "idle" };

export function CheckInbox({
  email,
  onUseAnotherEmail,
}: {
  email: string;
  onUseAnotherEmail: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    resendConfirmation,
    initialState,
  );

  return (
    <>
      <div
        aria-hidden
        className="relative mb-2 h-[104px] w-[150px] rounded-[22px] bg-paper shadow-[0_1px_2px_rgb(31_27_61/.06),0_10px_24px_rgb(46_42_120/.1)]"
      >
        <svg viewBox="0 0 150 104" className="absolute inset-0">
          <rect x="35" y="30" width="80" height="54" rx="10" fill="#E4DEFF" />
          <path
            d="M37 34 L75 62 L113 34"
            fill="none"
            stroke="#2E2A78"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          viewBox="0 0 44 34"
          className="ft-plane absolute -top-3.5 -right-2.5 h-[34px] w-11"
        >
          <path d="M2 16 L42 2 L30 32 L22 20 Z" fill="#E8742A" />
          <path d="M22 20 L42 2" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>
      <AuthHeading title="Check your inbox.">
        We sent a link to{" "}
        <b className="font-semibold text-ink">{email}</b>. Open it to finish
        setting up.
      </AuthHeading>
      <form action={formAction} className="flex gap-4">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={pending}
          className="h-11 cursor-pointer text-sm font-bold text-indigo disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send it again"}
        </button>
        <button
          type="button"
          onClick={onUseAnotherEmail}
          className="h-11 cursor-pointer text-sm font-semibold text-ink-soft"
        >
          Use another email
        </button>
      </form>
      {state.status === "check-email" && (
        <p role="status" className="text-sm text-ink-soft">
          Sent. It can take a minute to arrive.
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </>
  );
}
