"use client";

import { Ellipsis, Play } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/features/sessions/duration";
import { SplitBar } from "@/features/sessions/split-bar";
import {
  percent,
  totalSeconds,
  type KindSeconds,
} from "@/features/work/allocation";
import {
  setProjectArchived,
  setProjectWhy,
  updateProject,
  type ProjectFormState,
} from "./actions";
import {
  MAX_PROJECT_NAME_LENGTH,
  MAX_PROJECT_WHY_LENGTH,
} from "./project-input";
import { ProjectTile } from "./project-tile";
import type { Project } from "./queries";

const initialState: ProjectFormState = { status: "idle" };

export function ProjectCard({
  project,
  time,
  weekSeconds,
  lastLine,
  lastComment,
}: {
  project: Project;
  time: KindSeconds;
  weekSeconds: number;
  lastLine: string;
  lastComment: string | null;
}) {
  const [editingProject, setEditingProject] = useState(false);
  const [editingWhy, setEditingWhy] = useState(false);
  const total = totalSeconds(time);

  return (
    <article
      aria-label={project.name}
      className="ft-in flex flex-col gap-4 rounded-3xl bg-paper p-[22px] shadow-[0_1px_2px_rgb(31_27_61/.05),0_8px_24px_rgb(46_42_120/.06)]"
    >
      <div className="flex items-center gap-3">
        <ProjectTile id={project.id} name={project.name} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-[17px] font-semibold">{project.name}</h2>
          <span className="text-[13px] text-ink-muted">{lastLine}</span>
        </span>
        <button
          type="button"
          aria-label={`Edit ${project.name}`}
          aria-expanded={editingProject}
          onClick={() => setEditingProject((open) => !open)}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-muted hover:bg-wash"
        >
          <Ellipsis aria-hidden className="size-4" />
        </button>
      </div>

      {editingProject && (
        <ProjectEditForm
          project={project}
          onClose={() => setEditingProject(false)}
        />
      )}

      {editingWhy ? (
        <WhyForm project={project} onClose={() => setEditingWhy(false)} />
      ) : project.why ? (
        <button
          type="button"
          onClick={() => setEditingWhy(true)}
          aria-label={`Edit why ${project.name} matters`}
          className="flex cursor-pointer flex-col items-start gap-0.5 rounded-2xl bg-mist px-3.5 py-3 text-left"
        >
          <span className="text-xs font-semibold text-ink-muted">
            Why it matters
          </span>
          <span className="font-serif text-base leading-[22px]">
            {project.why}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEditingWhy(true)}
          className="flex cursor-pointer flex-col items-start gap-0.5 rounded-2xl border-[1.5px] border-dashed border-line-strong px-3.5 py-3 text-left"
        >
          <span className="text-sm font-semibold text-indigo">+ Add a goal</span>
          <span className="text-[13px] text-ink-soft">
            Time here counts as off-goal until it has one.
          </span>
        </button>
      )}

      <div className="flex items-end justify-between gap-3">
        <span className="flex flex-col gap-0.5">
          <span className="text-xs text-ink-muted">This week</span>
          <span className="font-serif text-[28px] leading-8">
            {formatDuration(weekSeconds)}
          </span>
        </span>
        <span className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-xs text-ink-muted">4 weeks</span>
          <span className="text-[15px] font-semibold">
            {formatDuration(total)}
            {total > 0 && ` · ${percent(time.execution, total)}% execution`}
          </span>
        </span>
      </div>
      <SplitBar
        execution={time.execution}
        preparation={time.preparation}
        className="h-2.5"
      />

      {lastComment && (
        <div className="flex flex-col gap-1 border-t border-line-soft pt-3.5">
          <span className="text-xs text-ink-muted">Last comment</span>
          <span className="font-serif text-[15px] leading-[22px] text-[#3e3a5e]">
            {lastComment}
          </span>
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <Link
          href={`/?project=${project.id}`}
          className="flex h-11 items-center gap-2 rounded-xl bg-wash px-3.5 text-[13px] font-semibold text-indigo"
        >
          <Play aria-hidden className="size-[11px] fill-current" />
          Start a session
        </Link>
        <Link
          href="/log"
          className="flex h-11 items-center rounded-xl px-3 text-[13px] font-semibold text-ink-soft"
        >
          See sessions
        </Link>
      </div>
    </article>
  );
}

function WhyForm({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [state, formAction, saving] = useActionState(
    async (previous: ProjectFormState, formData: FormData) => {
      const result = await setProjectWhy(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );
  const inputId = `why-${project.id}`;

  return (
    <form action={formAction} className="ft-pop flex flex-col gap-2">
      <input type="hidden" name="id" value={project.id} />
      <label htmlFor={inputId} className="text-xs font-semibold text-ink-muted">
        Why does this project matter?
      </label>
      <Input
        id={inputId}
        name="why"
        defaultValue={project.why ?? ""}
        maxLength={MAX_PROJECT_WHY_LENGTH}
        autoFocus
        placeholder="e.g. Become a stronger systems programmer"
        className="h-11 rounded-xl border-[1.5px] border-line-strong px-3 font-serif text-[15px] md:text-[15px]"
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={saving}
          className="h-11 rounded-[10px] px-3.5 text-[13px] font-semibold"
        >
          {saving ? "Saving…" : "Save goal"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="h-11 rounded-[10px] px-3 text-[13px] font-semibold text-ink-soft"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ProjectEditForm({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [archiving, startArchive] = useTransition();
  const [state, formAction, saving] = useActionState(
    async (previous: ProjectFormState, formData: FormData) => {
      const result = await updateProject(previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="ft-in flex flex-col gap-2.5">
      <input type="hidden" name="id" value={project.id} />
      <Input
        name="name"
        defaultValue={project.name}
        aria-label="Project name"
        maxLength={MAX_PROJECT_NAME_LENGTH}
        required
        autoFocus
        className="h-11 rounded-xl"
      />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" className="h-11 rounded-xl px-4" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-xl"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="ml-auto h-11 rounded-xl text-ink-muted"
          disabled={archiving}
          onClick={() =>
            startArchive(() => setProjectArchived(project.id, true))
          }
        >
          {archiving ? "Archiving…" : "Archive"}
        </Button>
      </div>
    </form>
  );
}
