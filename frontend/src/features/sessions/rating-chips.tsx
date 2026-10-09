import { ChoiceChips } from "./choice-chips";

const RATINGS = ["1", "2", "3", "4", "5"].map((value) => ({
  id: value,
  name: value,
}));

// Radios cannot be unchecked, so editing offers an explicit "not rated" chip.
const RATINGS_WITH_NONE = [{ id: "", name: "–" }, ...RATINGS];

export function RatingChips({
  name,
  label,
  low,
  high,
  defaultValue,
  clearable,
}: {
  name: string;
  label: string;
  low: string;
  high: string;
  defaultValue: number | null;
  clearable: boolean;
}) {
  return (
    <ChoiceChips
      name={name}
      legend={
        <>
          {label}{" "}
          <span className="font-normal text-muted-foreground">
            (optional · 1 {low}, 5 {high})
          </span>
        </>
      }
      options={clearable ? RATINGS_WITH_NONE : RATINGS}
      defaultValue={toChipValue(defaultValue, clearable)}
      required={false}
    />
  );
}

function toChipValue(
  rating: number | null,
  clearable: boolean,
): string | undefined {
  if (rating !== null) return String(rating);
  return clearable ? "" : undefined;
}
