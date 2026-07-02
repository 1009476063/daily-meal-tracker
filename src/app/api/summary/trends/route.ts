import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "缺少 month(YYYY-MM)" }, { status: 400 });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-${String(new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate()).padStart(2, "0")}`;

    const supabase = createSupabaseServerClient();

    const { data: meals, error } = await supabase
      .from("meal_meals")
      .select("date, meal_items(kcal, protein_g, fat_g, carb_g, fiber_g, sodium_mg, sugar_g, calcium_mg)")
      .eq("user_id", auth.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const dailyMap: Record<string, { kcal: number; protein_g: number; fat_g: number; carb_g: number; fiber_g: number; sodium_mg: number; sugar_g: number; calcium_mg: number }> = {};

    for (const meal of meals ?? []) {
      if (!dailyMap[meal.date]) dailyMap[meal.date] = { kcal: 0, protein_g: 0, fat_g: 0, carb_g: 0, fiber_g: 0, sodium_mg: 0, sugar_g: 0, calcium_mg: 0 };
      for (const item of meal.meal_items ?? []) {
        const d = dailyMap[meal.date];
        d.kcal += Number(item.kcal ?? 0);
        d.protein_g += Number(item.protein_g ?? 0);
        d.fat_g += Number(item.fat_g ?? 0);
        d.carb_g += Number(item.carb_g ?? 0);
        d.fiber_g += Number(item.fiber_g ?? 0);
        d.sodium_mg += Number(item.sodium_mg ?? 0);
        d.sugar_g += Number(item.sugar_g ?? 0);
        d.calcium_mg += Number(item.calcium_mg ?? 0);
      }
    }

    const series = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    return NextResponse.json({ month, series });
  } catch (err) {
    console.error("[/api/summary/trends]", err);
    return NextResponse.json({ error: "服务端错误" }, { status: 500 });
  }
}
