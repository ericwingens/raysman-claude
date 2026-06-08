import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseServer } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service-role key. Returns null when
 * Supabase is not configured so callers can fall back to the local seed.
 * NEVER import this from client components.
 */
export function getServiceClient(): SupabaseClient | null {
  if (!hasSupabaseServer()) return null;
  if (cached) return cached;
  cached = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
