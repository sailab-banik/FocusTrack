import { CATEGORY_KINDS, type CategoryKind } from "./category-input";

const KIND_LABELS: Record<CategoryKind, string> = {
  execution: "Execution",
  preparation: "Preparation",
};

export function KindSelect({
  defaultValue,
  id,
}: {
  defaultValue: CategoryKind;
  id?: string;
}) {
  return (
    <select
      id={id}
      name="kind"
      defaultValue={defaultValue}
      aria-label="Kind"
      className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
    >
      {CATEGORY_KINDS.map((kind) => (
        <option key={kind} value={kind}>
          {KIND_LABELS[kind]}
        </option>
      ))}
    </select>
  );
}
