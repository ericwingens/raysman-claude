"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, hasSupabasePublic } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Browser Supabase client (anon key). Null when not configured. */
export function getBrowserClient(): SupabaseClient | null {
  if (!hasSupabasePublic()) return null;
  if (cached) return cached;
  cached = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return cached;
}
