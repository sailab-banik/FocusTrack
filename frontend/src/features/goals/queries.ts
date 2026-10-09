import { createClient } from "@/lib/supabase/server";

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  archived: boolean;
};

export async function listGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("id, title, description, archived_at")
    .order("created_at");
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    archived: row.archived_at !== null,
  }));
}
