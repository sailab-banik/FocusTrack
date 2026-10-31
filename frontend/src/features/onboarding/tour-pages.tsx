import { cn } from "cn";

// Every number and name on these scenes is sample data.
export const TOUR_PAGES = [
  {
    title: "Every session is execution or preparation.",
    body: "Building and creating make things. Learning and planning get you ready. Both count, but only one ships.",
    Scene: KindsScene,
  },
  {
    title: "Projects hold your sessions.",
    body: "Give a project a reason if you like. Time on projects without one still shows up, honestly.",
    Scene: ProjectsScene,
  },
  {
    title: "End each session with one line.",
    body: "What did you get done? That line is what your weekly read is built from, not the minutes.",
    Scene: CommentScene,
  },
  {
    title: "A weekly read that won’t flatter you.",
    body: "AI-assisted, built from your own numbers, ending in one next step. Optional: everything else works without it.",
    Scene: ReportScene,
  },
];

function delay(ms: number) {
  return { animationDelay: `${ms}ms` };
}

const EXECUTION_CHIPS = [
  { name: "Build", fx: 90, fy: 150, fr: -8, at: 200 },
  { name: "Create", fx: 20, fy: 190, fr: 6, at: 300 },
  { name: "Work", fx: -110, fy: 140, fr: -5, at: 400 },
  { name: "Practice", fx: 140, fy: 120, fr: 9, at: 500 },
];

const PREPARATION_CHIPS = [
  { name: "Learn", fx: 100, fy: -120, fr: 7, at: 250 },
  { name: "Brainstorm", fx: -20, fy: -150, fr: -6, at: 350 },
  { name: "Review", fx: -90, fy: -110, fr: 5, at: 450 },
];

function FlyingChips({ chips }: { chips: typeof EXECUTION_CHIPS }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.name}
          className="ft-fly inline-flex h-[30px] items-center rounded-full bg-paper px-[11px] text-[13px] font-semibold shadow-[0_2px_6px_rgb(31_27_61/.1)]"
          style={
            {
              "--fx": `${chip.fx}px`,
              "--fy": `${chip.fy}px`,
              "--fr": `${chip.fr}deg`,
              ...delay(chip.at),
            } as React.CSSProperties
          }
        >
          {chip.name}
        </span>
      ))}
    </div>
  );
}

function KindsScene() {
  return (
    <div className="flex size-full flex-col gap-2.5 p-[18px]">
      <div className="flex flex-col gap-2 rounded-2xl bg-tangerine-soft p-2.5">
        <span
          className="ft-in flex items-center gap-1.5 text-xs font-bold text-tangerine-text"
          style={delay(900)}
        >
          <span className="size-2 rounded-[2px] bg-tangerine" />
          Execution · making things
        </span>
        <FlyingChips chips={EXECUTION_CHIPS} />
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-periwinkle-soft p-2.5">
        <span
          className="ft-in flex items-center gap-1.5 text-xs font-bold text-periwinkle-text"
          style={delay(1000)}
        >
          <span className="size-2 rounded-full bg-periwinkle" />
          Preparation · getting ready
        </span>
        <FlyingChips chips={PREPARATION_CHIPS} />
      </div>
      <div className="ft-in mt-auto flex flex-col gap-1.5" style={delay(1300)}>
        <div className="flex justify-between text-xs text-ink-soft">
          <span>A sample day · 2h 56m</span>
          <span className="font-bold text-ink">71% execution</span>
        </div>
        <div className="ft-grow flex h-2.5 gap-[3px]" style={delay(1400)}>
          <span className="w-[71%] rounded-[5px] bg-tangerine" />
          <span className="flex-1 rounded-[5px] bg-periwinkle" />
        </div>
      </div>
    </div>
  );
}

const SAMPLE_PROJECTS = [
  {
    name: "FocusTrack",
    initial: "F",
    tint: "bg-peach",
    why: "Why: ship a tracker I use daily",
    time: "3h 13m",
    popAt: 250,
    typeAt: 800,
  },
  {
    name: "Night Signals EP",
    initial: "N",
    tint: "bg-lilac",
    why: "Why: release four tracks",
    time: "34m",
    popAt: 420,
    typeAt: 1700,
  },
  {
    name: "Rust book",
    initial: "R",
    tint: "bg-butter",
    why: null,
    time: "50m",
    popAt: 590,
    typeAt: 0,
  },
];

function ProjectsScene() {
  return (
    <div className="flex size-full flex-col gap-2.5 p-[18px]">
      {SAMPLE_PROJECTS.map((project) => (
        <div
          key={project.name}
          className="ft-pop grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] bg-mist p-3"
          style={delay(project.popAt)}
        >
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-xl font-bold",
              project.tint,
            )}
          >
            {project.initial}
          </span>
          <span className="flex min-w-0 flex-col items-start gap-[3px]">
            <span className="text-sm font-semibold">{project.name}</span>
            {project.why ? (
              <span
                className="ft-type font-serif text-[13px] whitespace-nowrap text-ink-soft"
                style={delay(project.typeAt)}
              >
                {project.why}
              </span>
            ) : (
              <span className="inline-flex h-[22px] items-center rounded-full border-[1.5px] border-dashed border-line-strong px-2 text-[11px] font-bold text-indigo">
                + Add a goal
              </span>
            )}
          </span>
          <span className="text-[13px] font-bold">{project.time}</span>
        </div>
      ))}
      <div
        className="ft-in mt-auto flex justify-between text-xs text-ink-soft"
        style={delay(2600)}
      >
        <span>On a goal this week</span>
        <span className="font-bold text-ink">87%</span>
      </div>
    </div>
  );
}

function CommentScene() {
  return (
    <div className="size-full p-[18px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-peach text-xs font-bold">
            F
          </span>
          FocusTrack
        </span>
        <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-tangerine-soft px-2.5 text-xs font-semibold text-tangerine-text">
          <span className="size-[7px] rounded-[2px] bg-tangerine" />
          Build
        </span>
      </div>
      <span className="mt-2 block font-serif text-[58px] leading-16 tracking-[-0.03em]">
        1:32:00
      </span>
      <span
        className="ft-press mt-2 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo px-4 text-sm font-semibold text-white"
        style={delay(700)}
      >
        <span className="size-[9px] rounded-[2px] bg-white" />
        Stop
      </span>
      <div className="ft-dim absolute inset-0 bg-ink/28" style={delay(1000)} />
      <div
        className="ft-sheet absolute inset-x-0 bottom-0 flex flex-col gap-2.5 rounded-t-[22px] bg-paper px-[18px] pt-4 pb-[18px] shadow-[0_-10px_30px_rgb(31_27_61/.18)]"
        style={delay(1000)}
      >
        <span className="h-1 w-9 self-center rounded-sm bg-line" />
        <span className="font-serif text-[21px]">What did you get done?</span>
        <div className="flex h-[46px] items-center rounded-xl border-[1.5px] border-periwinkle px-3 font-serif text-base shadow-[0_0_0_4px_var(--color-periwinkle-soft)]">
          <span
            className="ft-type whitespace-nowrap"
            style={{ ...delay(1700), animationDuration: "1300ms" }}
          >
            Shipped pause and resume.
          </span>
          <span
            className="ft-caret ml-0.5 h-5 w-[1.5px] bg-tangerine"
            style={delay(1600)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-muted">One line is enough.</span>
          <span
            className="ft-press inline-flex h-9 items-center gap-1.5 rounded-[11px] bg-indigo px-4 text-[13px] font-semibold text-white"
            style={delay(3300)}
          >
            <svg
              viewBox="0 0 14 14"
              className="size-3 fill-none stroke-current stroke-[2.2]"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M2.5 7.5 L5.5 10.5 L11.5 3.5"
                className="ft-check"
                style={delay(3450)}
              />
            </svg>
            Save
          </span>
        </div>
      </div>
      <span
        className="ft-pop absolute top-4 right-4 inline-flex h-[30px] items-center rounded-full bg-mint px-3 text-xs font-bold text-mint-text shadow-[0_6px_16px_rgb(31_27_61/.12)]"
        style={delay(3800)}
      >
        Added to today
      </span>
    </div>
  );
}

const SAMPLE_WEEK = [
  { height: 62, preparation: 40, execution: 110 },
  { height: 66, preparation: 40, execution: 120 },
  { height: 40, preparation: 35, execution: 60 },
  { height: 72, preparation: 30, execution: 140 },
  { height: 50, preparation: 40, execution: 80 },
  { height: 49, preparation: 34, execution: 83 },
];

function ReportScene() {
  return (
    <div className="flex size-full flex-col gap-3 p-[18px]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-soft">
          Week of Oct 5 · sample
        </span>
        <span className="inline-flex h-6 items-center rounded-full bg-wash px-[9px] text-[11px] font-bold text-ink-soft">
          AI-assisted
        </span>
      </div>
      <div className="flex h-[82px] shrink-0 items-end gap-2 border-b border-line-soft px-1">
        {SAMPLE_WEEK.map((day, index) => (
          <span
            key={index}
            className="ft-up flex flex-1 flex-col gap-0.5"
            style={{ height: day.height, ...delay(200 + index * 80) }}
          >
            <span
              className="rounded-t-[4px] rounded-b-[1px] bg-periwinkle"
              style={{ flex: day.preparation }}
            />
            <span
              className="rounded-t-[1px] rounded-b-[4px] bg-tangerine"
              style={{ flex: day.execution }}
            />
          </span>
        ))}
        <span className="h-1 flex-1 rounded-sm bg-line-soft" />
      </div>
      <span
        className="ft-in font-serif text-[19px] leading-[25px]"
        style={delay(1000)}
      >
        13h 32m, 73% execution, every hour on a goal.
      </span>
      <span
        className="ft-in text-[13px] leading-[19px] text-ink-soft"
        style={delay(1300)}
      >
        System design was all reading. The last mock was 9 days ago.
      </span>
      <div
        className="ft-slide mt-auto flex items-center gap-2.5 rounded-[14px] bg-tangerine-soft px-3 py-2.5"
        style={delay(1700)}
      >
        <span className="text-[11px] font-extrabold text-tangerine-text">
          Next
        </span>
        <span className="font-serif text-sm">Book two morning mocks.</span>
      </div>
    </div>
  );
}
