import { createClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  name: string;
  archived: boolean;
  why: string | null;
};

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, archived_at, why")
    .order("name");
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    archived: row.archived_at !== null,
    why: row.why,
  }));
}
