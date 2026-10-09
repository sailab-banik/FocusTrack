import { cn } from "cn";
import type { CategoryKind } from "@/features/categories/category-input";
import { KindMark } from "@/features/categories/kind-mark";

export type ChoiceOption = { id: string; name: string; kind?: CategoryKind };

// Native radios styled as chips: one tap to choose, no JS needed, and the
// selection submits with the form.
export function ChoiceChips({
  name,
  legend,
  options,
  defaultValue,
  required,
}: {
  name: string;
  legend: React.ReactNode;
  options: ChoiceOption[];
  defaultValue: string | undefined;
  required: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2.5 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            data-kind={option.kind}
            className={cn(
              "group/chip flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-input bg-card px-4 text-sm transition-colors select-none hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              option.kind
                ? "has-checked:border-kind has-checked:bg-kind has-checked:text-on-kind"
                : "has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              defaultChecked={option.id === defaultValue}
              required={required}
              className="sr-only"
            />
            {option.kind && (
              <KindMark
                kind={option.kind}
                className="group-has-checked/chip:bg-on-kind"
              />
            )}
            {option.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
