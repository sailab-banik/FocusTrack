import { createClient } from "@/lib/supabase/server";

export type RunningSession = {
  id: string;
  projectId: string;
  categoryId: string;
  startedAt: string;
};

export async function getRunningSession(): Promise<RunningSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, project_id, category_id, started_at")
    .is("ended_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    projectId: data.project_id,
    categoryId: data.category_id,
    startedAt: data.started_at,
  };
}

export type LastUsed = { projectId: string; categoryId: string };

export async function getLastUsed(): Promise<LastUsed | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("project_id, category_id")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { projectId: data.project_id, categoryId: data.category_id };
}
