// Centralized, lazy access to environment configuration. Nothing here throws at
// import time: every integration is optional so the app can run on local seed.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
  anthropicPlanningModel: process.env.ANTHROPIC_PLANNING_MODEL ?? "claude-opus-4-8",

  voyageApiKey: process.env.VOYAGE_API_KEY ?? "",
  voyageModel: process.env.VOYAGE_MODEL ?? "voyage-4",
  voyageDimensions: Number(process.env.VOYAGE_DIMENSIONS ?? 1024),

  asanaToken: process.env.ASANA_ACCESS_TOKEN ?? "",
  apolloKey: process.env.APOLLO_API_KEY ?? "",
};

/** True when a Supabase backend is configured (server side). */
export function hasSupabaseServer(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceKey);
}

/** True when the public (browser) Supabase client is configured. */
export function hasSupabasePublic(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasAnthropic(): boolean {
  return Boolean(env.anthropicApiKey);
}

export function hasVoyage(): boolean {
  return Boolean(env.voyageApiKey);
}
