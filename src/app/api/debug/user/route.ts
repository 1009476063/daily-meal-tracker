import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({ user: user ?? null, error: error?.message ?? null });
}
