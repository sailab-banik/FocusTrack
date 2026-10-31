export const MAX_NAME_LENGTH = 60;

/**
 * The name to use for someone, from their auth metadata: what they set in
 * Settings, then what Google gave. Clearing it in Settings means no name.
 */
export function displayName(metadata: unknown): string {
  if (typeof metadata !== "object" || metadata === null) return "";
  const { display_name, full_name, name } = metadata as Record<string, unknown>;
  if (typeof display_name === "string") return display_name;
  if (typeof full_name === "string") return full_name;
  if (typeof name === "string") return name;
  return "";
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0];
}
