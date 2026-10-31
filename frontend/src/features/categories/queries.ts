import { createClient } from "@/lib/supabase/server";
import type { CategoryKind } from "./category-input";

export type Category = { id: string; name: string; kind: CategoryKind };

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind")
    .order("name");
  if (error) throw error;
  return data;
}

/** Finished sessions per category, counted by the database. */
export async function countSessionsByCategory(
  categories: Category[],
): Promise<Map<string, number>> {
  const supabase = await createClient();
  const counts = await Promise.all(
    categories.map(async (category) => {
      const { count, error } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("category_id", category.id)
        .not("ended_at", "is", null);
      if (error) throw error;
      return [category.id, count ?? 0] as const;
    }),
  );
  return new Map(counts);
}
