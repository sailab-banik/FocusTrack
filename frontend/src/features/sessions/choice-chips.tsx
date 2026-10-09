type Option = { id: string; name: string };

// Native radios styled as chips: one tap to choose, no JS needed, and the
// selection submits with the form.
export function ChoiceChips({
  name,
  legend,
  options,
  defaultValue,
}: {
  name: string;
  legend: string;
  options: Option[];
  defaultValue: string | undefined;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex h-10 cursor-pointer items-center rounded-lg border px-3 text-sm transition-colors select-none hover:bg-muted has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              defaultChecked={option.id === defaultValue}
              required
              className="sr-only"
            />
            {option.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
