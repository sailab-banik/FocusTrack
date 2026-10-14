export function AuthHeading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight font-stretch-[112%] sm:text-4xl">
        {title}
      </h1>
      {children && <p className="text-muted-foreground">{children}</p>}
    </div>
  );
}
