import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geefzxozzuvrqvuuvxkr.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_XabhBjOi4WPCJn8fDV1O2w_D1CR6jO4";

/**
 * A Supabase client that never touches cookies. Used to create OTHER users'
 * accounts (auth.signUp) from a Server Action without swapping out the
 * currently signed-in admin's own session.
 */
export function createEphemeralSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
