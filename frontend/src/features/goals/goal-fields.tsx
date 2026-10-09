import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GOAL_LIMITS } from "./goal-input";

// Shared by the new-goal form and inline editing.
export function GoalFields({
  idPrefix,
  title,
  description,
}: {
  idPrefix: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-title`}>Goal</Label>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={title}
          placeholder="e.g. Become a stronger AI/backend engineer"
          maxLength={GOAL_LIMITS.title}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-description`}>
          What does success look like?{" "}
          <span className="font-normal text-muted-foreground">optional</span>
        </Label>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={description}
          maxLength={GOAL_LIMITS.description}
          rows={2}
        />
      </div>
    </>
  );
}
