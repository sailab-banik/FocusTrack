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
        <h1 className="text-3xl font-semibold tracking-tight font-stretch-[108%] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-prose text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
