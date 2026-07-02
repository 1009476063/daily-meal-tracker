import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAuthUser(request);
  if ("error" in auth) return auth.error;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meal_user_settings")
    .select("ai_base_url, ai_model, daily_kcal_target, daily_protein_target, daily_fat_target, daily_carb_target, daily_fiber_target, updated_at") // exclude ai_api_key from GET
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data ?? {
    user_id: auth.user.id,
    ai_base_url: null,
    ai_model: null,
    daily_kcal_target: 2000,
    daily_protein_target: 65,
    daily_fat_target: 60,
    daily_carb_target: 300,
    daily_fiber_target: 25,
  });
}

export async function PUT(request: Request) {
  const auth = await getAuthUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { user_id: _ignored, ...fields } = body;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meal_user_settings")
    .upsert({ user_id: auth.user.id, ...fields, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select("ai_base_url, ai_model, daily_kcal_target, daily_protein_target, daily_fat_target, daily_carb_target, daily_fiber_target, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
