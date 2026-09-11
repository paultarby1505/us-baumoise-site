import { createClient } from "@supabase/supabase-js";

// Clé publique (anon/publishable) : conçue pour être exposée côté client,
// la sécurité est assurée par les policies RLS côté Supabase, pas par le secret de cette clé.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geefzxozzuvrqvuuvxkr.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_XabhBjOi4WPCJn8fDV1O2w_D1CR6jO4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
