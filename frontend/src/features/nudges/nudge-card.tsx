export function NudgeCard({
  icon,
  title,
  children,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-[20px] bg-butter p-4 text-[#6b4e00] [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0">
      {icon}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm">{children}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
