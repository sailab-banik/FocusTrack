export function emailInList(list: string | undefined, email: string): boolean {
  if (!list || !email) return false;
  return list
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(email.toLowerCase());
}
