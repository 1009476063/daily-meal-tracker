import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth";

function emptyTotals() {
  return {
    total_kcal: 0,
    total_protein_g: 0,
    total_fat_g: 0,
    total_carb_g: 0,
    total_fiber_g: 0,
    total_saturated_fat_g: 0,
    total_sodium_mg: 0,
    total_calcium_mg: 0,
    total_iron_mg: 0,
    total_vitamin_c_mg: 0,
    total_vitamin_a_mcg: 0,
    total_sugar_g: 0,
    total_cholesterol_mg: 0,
  } as Record<string, number>;
}

function analyzeIssues(totals: ReturnType<typeof emptyTotals>, daysWithData: number) {
  const issues: string[] = [];
  if (!daysWithData) return issues;

  const avg = (v: number) => Math.round(v / daysWithData);

  if (avg(totals.total_sodium_mg) > 2000) {
    issues.push(`日均钠摄入偏高（${avg(totals.total_sodium_mg)}mg），建议减少高盐食物。`);
  }
  if (avg(totals.total_fiber_g) < 10) {
    issues.push(`日均膳食纤维偏低（${avg(totals.total_fiber_g)}g），建议增加全谷物、蔬菜与水果。`);
  }
  if (avg(totals.total_protein_g) < 40) {
    issues.push(`日均蛋白质偏低（${avg(totals.total_protein_g)}g），建议增加优质蛋白来源。`);
  }
  if (avg(totals.total_sugar_g) > 40) {
    issues.push(`日均糖摄入偏高（${avg(totals.total_sugar_g)}g），建议减少甜食与含糖饮料。`);
  }
  if (avg(totals.total_saturated_fat_g) > 20) {
    issues.push(`日均饱和脂肪偏高（${avg(totals.total_saturated_fat_g)}g），建议减少油炸与加工食品。`);
  }
  if (avg(totals.total_calcium_mg) < 500) {
    issues.push(`日均钙摄入偏低（${avg(totals.total_calcium_mg)}mg），建议增加奶制品与豆制品。`);
  }

  return issues;
}

function sumItemTotals(totals: Record<string, number>, item: Record<string, unknown>) {
  totals.total_kcal += Number(item.kcal ?? 0);
  totals.total_protein_g += Number(item.protein_g ?? 0);
  totals.total_fat_g += Number(item.fat_g ?? 0);
  totals.total_carb_g += Number(item.carb_g ?? 0);
  totals.total_fiber_g += Number(item.fiber_g ?? 0);
  totals.total_saturated_fat_g += Number(item.saturated_fat_g ?? 0);
  totals.total_sodium_mg += Number(item.sodium_mg ?? 0);
  totals.total_calcium_mg += Number(item.calcium_mg ?? 0);
  totals.total_iron_mg += Number(item.iron_mg ?? 0);
  totals.total_vitamin_c_mg += Number(item.vitamin_c_mg ?? 0);
  totals.total_vitamin_a_mcg += Number(item.vitamin_a_mcg ?? 0);
  totals.total_sugar_g += Number(item.sugar_g ?? 0);
  totals.total_cholesterol_mg += Number(item.cholesterol_mg ?? 0);
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
        const month = searchParams.get("month"); // YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "缺少 month(YYYY-MM)" }, { status: 400 });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-${String(new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate()).padStart(2, "0")}`;

    const supabase = createSupabaseServerClient();

    const { data: meals, error } = await supabase
      .from("meal_meals")
      .select("id, date, meal_type, created_at, photo_url, photo_urls, person_count, meal_advice, dietary_structure_advice, meal_items(name, kcal, protein_g, fat_g, carb_g, fiber_g, portion_grams, saturated_fat_g, sodium_mg, calcium_mg, iron_mg, vitamin_c_mg, vitamin_a_mcg, sugar_g, cholesterol_mg, food_group, dietary_advice, confidence)")
      .eq("user_id", auth.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const totals = emptyTotals();
    const daysWithData = new Set<string>();

    for (const meal of meals ?? []) {
      daysWithData.add(meal.date);
      for (const item of meal.meal_items ?? []) {
        sumItemTotals(totals, item as Record<string, unknown>);
      }
    }

    const issues = analyzeIssues(totals, daysWithData.size);

    return NextResponse.json({
      month,
      days_with_data: daysWithData.size,
      totals,
      issues,
    });
  } catch (err) {
    console.error("[/api/summary/monthly]", err);
    return NextResponse.json({ error: "服务端错误", totals: emptyTotals(), days_with_data: 0, issues: [] }, { status: 500 });
  }
}
