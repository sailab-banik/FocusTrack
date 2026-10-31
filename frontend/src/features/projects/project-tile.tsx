import { cn } from "cn";
import { projectTint } from "./project-tint";

const SIZES = {
  xs: "size-[22px] rounded-[7px] text-[11px]",
  sm: "size-8 rounded-[10px] text-[13px]",
  md: "size-10 rounded-xl text-sm",
};

/** A rounded square in the project's tint with its initial. */
export function ProjectTile({
  id,
  name,
  size = "md",
}: {
  id: string;
  name: string;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-ink",
        SIZES[size],
        projectTint(id),
      )}
    >
      {name[0].toUpperCase()}
    </span>
  );
}
