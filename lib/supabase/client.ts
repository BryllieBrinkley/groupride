import { env } from "@/lib/env";

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseBrowserConfig(): SupabaseClientConfig {
  const url = env.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.supabaseAnonKey ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return { url, anonKey };
}
