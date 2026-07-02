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
      .select("date, meal_items(kcal, protein_g, fat_g, carb_g, fiber_g, sodium_mg, sugar_g, saturated_fat_g, calcium_mg, iron_mg, vitamin_c_mg, vitamin_a_mcg, cholesterol_mg, food_group, dietary_advice)")
      .eq("user_id", auth.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const totals: Record<string, number> = {
      kcal: 0, protein_g: 0, fat_g: 0, carb_g: 0, fiber_g: 0, sodium_mg: 0, sugar_g: 0, saturated_fat_g: 0, calcium_mg: 0, iron_mg: 0, vitamin_c_mg: 0, vitamin_a_mcg: 0, cholesterol_mg: 0,
    };
    const daysWithData = new Set<string>();
    const groupCounts: Record<string, number> = {};

    for (const meal of meals ?? []) {
      daysWithData.add(meal.date);
      for (const item of meal.meal_items ?? []) {
        totals.kcal += Number(item.kcal ?? 0);
        totals.protein_g += Number(item.protein_g ?? 0);
        totals.fat_g += Number(item.fat_g ?? 0);
        totals.carb_g += Number(item.carb_g ?? 0);
        totals.fiber_g += Number(item.fiber_g ?? 0);
        totals.sodium_mg += Number(item.sodium_mg ?? 0);
        totals.sugar_g += Number(item.sugar_g ?? 0);
        totals.saturated_fat_g += Number(item.saturated_fat_g ?? 0);
        totals.calcium_mg += Number(item.calcium_mg ?? 0);
        totals.iron_mg += Number(item.iron_mg ?? 0);
        totals.vitamin_c_mg += Number(item.vitamin_c_mg ?? 0);
        totals.vitamin_a_mcg += Number(item.vitamin_a_mcg ?? 0);
        totals.cholesterol_mg += Number(item.cholesterol_mg ?? 0);
        if (item.food_group) groupCounts[item.food_group] = (groupCounts[item.food_group] ?? 0) + 1;
      }
    }

    const days = daysWithData.size || 1;
    const avg = Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, Math.round(v / days)]));

    const issues: string[] = [];
    if (avg.sodium_mg > 2000) issues.push("日均钠摄入偏高，建议减少高盐食物与调味品。");
    if (avg.fiber_g < 10) issues.push("日均膳食纤维偏低，建议增加全谷物、蔬菜与水果。");
    if (avg.protein_g < 40) issues.push("日均蛋白质偏低，建议增加优质蛋白来源。");
    if (avg.sugar_g > 40) issues.push("日均糖摄入偏高，建议减少甜食与含糖饮料。");
    if (avg.calcium_mg < 500) issues.push("日均钙摄入偏低，建议增加奶制品与豆制品。");

    const highGroups = Object.entries(groupCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g, c]) => `${g}(${c})`);

    return NextResponse.json({
      month,
      days_with_data: daysWithData.size,
      totals,
      averages: avg,
      food_group_top: highGroups,
      issues,
      summary: `本月记录${daysWithData.size}天，日均摄入${avg.kcal}kcal；主要问题：${issues.length ? issues.join(" ") : "暂无显著问题。"}`,
    });
  } catch (err) {
    console.error("[/api/report/monthly]", err);
    return NextResponse.json({ error: "服务端错误" }, { status: 500 });
  }
}
