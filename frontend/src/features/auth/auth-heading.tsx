export function AuthHeading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="ft-in font-serif text-[30px] leading-9 lg:text-[44px] lg:leading-[50px]">
        {title}
      </h1>
      {children && (
        <p className="text-[15px] leading-[22px] text-ink-soft lg:text-lg lg:leading-[27px]">
          {children}
        </p>
      )}
    </div>
  );
}
