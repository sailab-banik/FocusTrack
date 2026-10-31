/**
 * The content beside the daytime sky: under it on phones, to its right on
 * desktop. The left column is as wide as the sky at this stage.
 */
export function DayColumn({
  aside,
  children,
  footer,
}: {
  aside?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative z-2 grid min-h-dvh lg:grid-cols-[38.9%_1fr]">
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:px-10">
        {aside}
      </div>
      <main className="flex min-w-0 flex-col px-6 pt-[214px] pb-6 lg:px-12 lg:pt-12">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center gap-4 pb-8">
          {children}
        </div>
        {footer}
      </main>
    </div>
  );
}
