const TINTS = [
  "bg-peach",
  "bg-mint",
  "bg-sky",
  "bg-lilac",
  "bg-butter",
  "bg-rose",
];

/** The project's tile color: chosen by its id, so it never changes. */
export function projectTint(projectId: string): string {
  let hash = 0;
  for (const char of projectId) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1_000_003;
  }
  return TINTS[hash % TINTS.length];
}
