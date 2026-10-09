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
