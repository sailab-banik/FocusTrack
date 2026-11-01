"use client";

import { Mic, Square } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";
import { stopSession, type SessionFormState } from "./actions";
import { appendDictation } from "./dictation";
import { DiscardSessionButton } from "./discard-session-button";
import { outcomePlaceholder } from "./outcome-placeholder";
import { MAX_COMMENT_LENGTH } from "./session-log";
import { useDictation } from "./use-dictation";

const initialState: SessionFormState = { status: "idle" };

/**
 * The one question at the end of a session. The native dialog brings the
 * focus trap, and Escape means "Keep going". It is a bottom sheet on phones.
 */
export function StopDialog({
  sessionId,
  stoppedAt,
  elapsedSeconds,
  label,
  categoryName,
  projectName,
  kind,
  onKeepGoing,
  onSaved,
}: {
  sessionId: string;
  stoppedAt: Date;
  elapsedSeconds: number;
  /** e.g. "FocusTrack · Build · 47m" */
  label: string;
  categoryName: string;
  projectName: string;
  kind: CategoryKind;
  onKeepGoing: () => void;
  onSaved: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [comment, setComment] = useState("");
  const dictation = useDictation((text) =>
    setComment((written) =>
      appendDictation(written, text, MAX_COMMENT_LENGTH),
    ),
  );
  // Picked once per opening, so it holds still while the user types and erases.
  const [placeholder] = useState(() =>
    outcomePlaceholder({ categoryName, kind, projectName }),
  );
  const [state, formAction, pending] = useActionState(
    async (previous: SessionFormState, formData: FormData) => {
      const result = await stopSession(previous, formData);
      if (result.status === "idle") onSaved();
      return result;
    },
    initialState,
  );

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="stop-heading"
      onCancel={(event) => {
        event.preventDefault();
        onKeepGoing();
      }}
      className="ft-dialog"
    >
      <span
        aria-hidden
        className="mx-auto mb-1 block h-[5px] w-10 rounded-full bg-line md:hidden"
      />
      <form action={formAction} className="flex flex-col gap-3.5 md:gap-4">
        <input type="hidden" name="id" value={sessionId} />
        <input type="hidden" name="stoppedAt" value={stoppedAt.toISOString()} />
        <span
          data-kind={kind}
          className="inline-flex min-h-[30px] items-center gap-[7px] self-start rounded-full bg-kind-soft px-3 py-1 text-[13px] font-semibold text-kind-text"
        >
          <KindMark kind={kind} className="size-2" />
          {label}
        </span>
        <label
          id="stop-heading"
          htmlFor="stop-comment"
          className="font-serif text-[26px] leading-8 md:text-[30px] md:leading-9"
        >
          What did you get done?
        </label>
        <textarea
          id="stop-comment"
          name="outcome"
          rows={3}
          required
          autoFocus
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={placeholder}
          className="resize-none rounded-2xl border-[1.5px] border-line-strong bg-paper p-3.5 font-serif text-[17px] leading-6 outline-none placeholder:text-[#8e8ba6] focus:border-periwinkle focus:shadow-[0_0_0_4px_var(--color-periwinkle-soft)] md:px-4 md:text-lg md:leading-[26px]"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-ink-muted">
            {dictation.listening
              ? dictation.heard || "Listening…"
              : "One line is enough. It’s what your reports read."}
          </span>
          {dictation.supported && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={dictation.toggle}
              aria-label="Voice input"
              aria-pressed={dictation.listening}
              className="size-11 shrink-0 rounded-full border-line-strong aria-pressed:border-periwinkle aria-pressed:bg-periwinkle-soft aria-pressed:text-periwinkle-text"
            >
              {dictation.listening ? (
                <Square aria-hidden className="ft-pulse size-4 fill-current" />
              ) : (
                <Mic aria-hidden className="size-5" />
              )}
            </Button>
          )}
        </div>
        {dictation.error && (
          <p role="alert" className="text-sm text-destructive">
            {dictation.error}
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center justify-end gap-2 md:gap-2.5">
          {/* For a session started by accident. Sits apart from Save. */}
          <div className="mr-auto max-w-full">
            <DiscardSessionButton
              sessionId={sessionId}
              elapsedSeconds={elapsedSeconds}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onKeepGoing}
            className="h-14 rounded-2xl border-line-strong px-3.5 text-[15px] font-medium md:h-12 md:rounded-[14px] md:px-[18px]"
          >
            Keep going
          </Button>
          <Button
            type="submit"
            disabled={pending || dictation.listening || comment.trim() === ""}
            className="h-14 rounded-2xl px-4 text-base font-semibold disabled:bg-line disabled:text-ink-muted disabled:opacity-100 md:h-12 md:flex-none md:rounded-[14px] md:px-[22px] md:text-[15px]"
          >
            {pending ? "Saving…" : "Save session"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}

const SAVED_MS = 1500;

/** The one celebrated moment: a note drops into the box. */
export function SavedMoment({
  line,
  onDone,
}: {
  line: string;
  onDone: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
    const timer = setTimeout(onDone, SAVED_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <dialog ref={dialog} aria-labelledby="saved-heading" className="ft-dialog">
      <div className="flex flex-col items-center gap-3.5 pt-3 pb-2 text-center">
        <div
          aria-hidden
          className="relative h-[130px] w-[180px] overflow-hidden rounded-3xl bg-mint"
        >
          <svg viewBox="0 0 180 130" className="absolute inset-0">
            <rect x="50" y="70" width="80" height="56" rx="14" fill="#FFFFFF" opacity=".75" />
            <rect x="58" y="92" width="64" height="6" rx="3" fill="#9ED9BF" />
            <rect x="58" y="104" width="64" height="6" rx="3" fill="#9ED9BF" />
          </svg>
          <div className="ft-drop absolute top-9 left-[62px] h-[42px] w-14 rounded-lg bg-paper shadow-[0_6px_14px_rgb(31_27_61/.14)]">
            <span className="absolute top-3 left-[9px] h-1 w-[34px] rounded-sm bg-tangerine" />
            <span className="absolute top-[22px] left-[9px] h-1 w-6 rounded-sm bg-peach" />
          </div>
        </div>
        <span id="saved-heading" className="font-serif text-[26px]">
          Added to today.
        </span>
        <span className="text-sm text-ink-soft">{line}</span>
      </div>
    </dialog>
  );
}
