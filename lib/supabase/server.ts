import { env } from "@/lib/env";

export interface SupabaseServerConfig {
  url: string;
  serviceRoleKey: string;
}

export function getSupabaseServerConfig(): SupabaseServerConfig {
  if (!env.supabaseUrl) {
    throw new Error("Missing SUPABASE_URL");
  }

  if (!env.supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    url: env.supabaseUrl,
    serviceRoleKey: env.supabaseServiceRoleKey,
  };
}
