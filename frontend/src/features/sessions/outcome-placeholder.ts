import type { CategoryKind } from "@/features/categories/category-input";

const MAX_PROJECT_NAME_LENGTH = 20;

const LINES_BY_CATEGORY: Record<string, string[]> = {
  build: [
    "Shipped the log filters…",
    "Fixed the login bug…",
    "Cleaned up the API…",
    "Finished the {project} page…",
  ],
  create: [
    "Drafted the first verse…",
    "Finished the rough cut…",
    "Sketched the cover art…",
  ],
  work: [
    "Cleared the review queue…",
    "Sent the client update…",
    "Closed the {project} tickets…",
  ],
  practice: [
    "Nailed the tricky section…",
    "Drilled the hard parts…",
    "Solved three hard problems…",
  ],
  learn: [
    "Finally understood closures…",
    "Finished chapter four…",
    "Took notes on caching…",
  ],
  brainstorm: [
    "Mapped out three ideas…",
    "Narrowed down the options…",
    "Picked a direction…",
    "Rethought the {project} onboarding…",
  ],
  review: [
    "Found the weak spot…",
    "Decided what to cut…",
    "Checked {project} progress…",
  ],
};

// Categories can be renamed or added, so these catch any name not listed above.
const LINES_BY_KIND: Record<CategoryKind, string[]> = {
  execution: ["Finished the next piece…", "Moved {project} forward…"],
  preparation: ["Worked out next steps…", "Got clear on {project}…"],
};

export function outcomePlaceholder(
  {
    categoryName,
    kind,
    projectName,
  }: { categoryName: string; kind: CategoryKind; projectName: string },
  random: () => number = Math.random,
): string {
  const category = categoryName.trim().toLowerCase();
  // hasOwn: a category can be named "constructor", which every object inherits.
  const lines = Object.hasOwn(LINES_BY_CATEGORY, category)
    ? LINES_BY_CATEGORY[category]
    : LINES_BY_KIND[kind];
  // A long name would wrap the placeholder past one line.
  const usable =
    projectName.length > MAX_PROJECT_NAME_LENGTH
      ? lines.filter((line) => !line.includes("{project}"))
      : lines;
  const line = usable[Math.floor(random() * usable.length)];
  // A replacer function, so a "$&" in a project name stays literal.
  return line.replace("{project}", () => projectName);
}
