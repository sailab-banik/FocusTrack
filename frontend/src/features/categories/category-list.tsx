import { CategoryRow } from "./category-row";
import { KindMark } from "./kind-mark";
import type { Category } from "./queries";

const GROUPS = [
  {
    kind: "execution",
    title: "Execution",
    description: "Producing output: building, creating, shipping.",
  },
  {
    kind: "preparation",
    title: "Preparation",
    description: "Getting ready to produce: learning, planning, reviewing.",
  },
] as const;

export function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground">
        No categories yet. Add one above to start tracking sessions.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {GROUPS.map((group) => {
        const members = categories.filter((c) => c.kind === group.kind);
        return (
          <section key={group.kind} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <KindMark kind={group.kind} />
                {group.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">None.</p>
            ) : (
              <ul className="divide-y rounded-2xl border bg-card px-4">
                {members.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
