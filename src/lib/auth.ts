import { createServerSupabaseClient } from "./supabase-server";

export type Profile = {
  id: string;
  email: string;
  role: "owner" | "editor";
  created_at: string;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}
