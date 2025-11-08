import { supabase } from "./supabaseClient";
import type { Question } from "./types";

export async function listQuestions(limit = 50) {
  const { data, error } = await supabase
    .from("questions")
    .select("id,title,details,status,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: (data as Question[]) ?? null, error };
}

export async function insertQuestion(input: { title: string; details?: string }) {
  const payload = { title: input.title, details: input.details ?? null };
  const { data, error } = await supabase
    .from("questions")
    .insert(payload)
    .select()
    .single();

  return { data: (data as Question) ?? null, error };
}
