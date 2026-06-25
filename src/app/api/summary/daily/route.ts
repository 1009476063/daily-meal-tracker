import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const date = searchParams.get("date");

  if (!userId || !date) {
    return NextResponse.json({ error: "缺少 user_id 或 date" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { data: meals, error } = await supabase
    .from("meal_meals")
    .select("id, meal_type, created_at, photo_url, meal_items(name, kcal, protein_g, fat_g, carb_g)")
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const summary = (meals ?? []).reduce(
    (acc, meal) => {
      for (const item of meal.meal_items ?? []) {
        acc.total_kcal += Number(item.kcal ?? 0);
        acc.total_protein_g += Number(item.protein_g ?? 0);
        acc.total_fat_g += Number(item.fat_g ?? 0);
        acc.total_carb_g += Number(item.carb_g ?? 0);
      }
      return acc;
    },
    {
      total_kcal: 0,
      total_protein_g: 0,
      total_fat_g: 0,
      total_carb_g: 0,
    }
  );

  return NextResponse.json({ date, meals, summary });
}
