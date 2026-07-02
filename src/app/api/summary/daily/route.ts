import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) return NextResponse.json({ error: "缺少 date" }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data: meals, error } = await supabase
      .from("meal_meals")
      .select("id, meal_type, created_at, photo_url, photo_urls, person_count, meal_advice, dietary_structure_advice, meal_items(*)")
      .eq("user_id", auth.user.id)
      .eq("date", date)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const summary = (meals ?? []).reduce(
      (acc, meal) => {
        for (const item of meal.meal_items ?? []) {
          acc.total_kcal += Number(item.kcal ?? 0);
          acc.total_protein_g += Number(item.protein_g ?? 0);
          acc.total_fat_g += Number(item.fat_g ?? 0);
          acc.total_carb_g += Number(item.carb_g ?? 0);
          acc.total_fiber_g += Number(item.fiber_g ?? 0);
          acc.total_saturated_fat_g += Number(item.saturated_fat_g ?? 0);
          acc.total_sodium_mg += Number(item.sodium_mg ?? 0);
          acc.total_calcium_mg += Number(item.calcium_mg ?? 0);
          acc.total_iron_mg += Number(item.iron_mg ?? 0);
          acc.total_vitamin_c_mg += Number(item.vitamin_c_mg ?? 0);
          acc.total_vitamin_a_mcg += Number(item.vitamin_a_mcg ?? 0);
          acc.total_sugar_g += Number(item.sugar_g ?? 0);
          acc.total_cholesterol_mg += Number(item.cholesterol_mg ?? 0);
        }
        return acc;
      },
      { total_kcal: 0, total_protein_g: 0, total_fat_g: 0, total_carb_g: 0, total_fiber_g: 0, total_saturated_fat_g: 0, total_sodium_mg: 0, total_calcium_mg: 0, total_iron_mg: 0, total_vitamin_c_mg: 0, total_vitamin_a_mcg: 0, total_sugar_g: 0, total_cholesterol_mg: 0 }
    );

    return NextResponse.json({ date, meals, summary });
  } catch (err) {
    console.error("[/api/summary/daily]", err);
    return NextResponse.json({ error: "服务端错误" }, { status: 500 });
  }
}
