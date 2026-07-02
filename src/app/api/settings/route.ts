import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "缺少 user_id" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meal_user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Return settings or defaults
  return NextResponse.json(data ?? {
    user_id: userId,
    ai_base_url: null,
    ai_api_key: null,
    ai_model: null,
    daily_kcal_target: 2000,
    daily_protein_target: 65,
    daily_fat_target: 60,
    daily_carb_target: 300,
    daily_fiber_target: 25,
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { user_id, ...fields } = body;
  if (!user_id) return NextResponse.json({ error: "缺少 user_id" }, { status: 400 });

  const supabase = createSupabaseServerClient();

  // Upsert settings
  const { data, error } = await supabase
    .from("meal_user_settings")
    .upsert({ user_id, ...fields, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
