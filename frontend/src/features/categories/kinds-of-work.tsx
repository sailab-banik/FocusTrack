import { CategoryRow } from "./category-row";
import { KindMark } from "./kind-mark";
import { NewCategoryForm } from "./new-category-form";
import type { Category } from "./queries";

const KINDS = [
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

export function KindsOfWork({
  categories,
  secondsByCategory,
}: {
  categories: Category[];
  secondsByCategory: Map<string, number>;
}) {
  return (
    <section
      id="kinds"
      aria-labelledby="kinds-heading"
      className="flex scroll-mt-20 flex-col gap-6"
    >
      <div className="flex flex-col gap-1.5">
        <h2
          id="kinds-heading"
          className="text-xl font-semibold tracking-tight"
        >
          Kinds of work
        </h2>
        <p className="max-w-prose text-muted-foreground">
          Each category counts as execution or preparation. The split is
          what your execution ratio measures.
        </p>
      </div>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {KINDS.map((group) => {
          const members = categories.filter((c) => c.kind === group.kind);
          return (
            <div key={group.kind} className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5 border-b pb-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <KindMark kind={group.kind} />
                  {group.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>
              {members.length > 0 && (
                <ul className="flex flex-col">
                  {members.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      seconds={secondsByCategory.get(category.id) ?? 0}
                    />
                  ))}
                </ul>
              )}
              <NewCategoryForm kind={group.kind} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
