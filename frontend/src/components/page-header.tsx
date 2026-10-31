export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[34px] leading-10 tracking-[-0.01em] md:text-[44px] md:leading-[50px]">
          {title}
        </h1>
        {description && (
          <p className="max-w-prose text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
