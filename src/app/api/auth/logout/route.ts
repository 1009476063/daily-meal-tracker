import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function POST() {
  const supabase = createSupabaseServerClient();

  const { error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, note: "Server-side signout is controlled via client session removal." });
}
