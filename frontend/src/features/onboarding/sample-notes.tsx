const NOTES = [
  {
    meta: "Yesterday · FocusTrack",
    comment: "Shipped pause and resume.",
    place: "self-start -rotate-2",
  },
  {
    meta: "Today · System design",
    comment: "Notes plus one diagram.",
    place: "self-end rotate-2",
  },
];

/** Sample session comments floating on the sky: output is what gets kept. */
export function SampleNotes() {
  return (
    <div
      aria-hidden
      className="ft-in flex w-full max-w-[420px] flex-col gap-3.5"
      style={{ animationDelay: "500ms" }}
    >
      {NOTES.map((note) => (
        <div
          key={note.comment}
          className={`${note.place} max-w-80 rounded-[22px] bg-paper px-5 py-[18px] shadow-[0_16px_40px_rgb(46_42_120/.14)]`}
        >
          <span className="block text-xs font-semibold text-ink-muted">
            {note.meta}
          </span>
          <span className="mt-1 block font-serif text-[19px] leading-[26px]">
            {note.comment}
          </span>
        </div>
      ))}
    </div>
  );
}
