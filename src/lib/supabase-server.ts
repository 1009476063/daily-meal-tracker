import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const parsed = z
    .object({
      supabaseUrl: z.string().url(),
      serviceRoleKey: z.string().min(1),
    })
    .safeParse({ supabaseUrl, serviceRoleKey });

  if (!parsed.success) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(parsed.data.supabaseUrl, parsed.data.serviceRoleKey);
}
