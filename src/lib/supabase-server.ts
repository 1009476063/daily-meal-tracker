import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env";

export function createSupabaseServerClient() {
  const env = getServerEnv();
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY);
}
