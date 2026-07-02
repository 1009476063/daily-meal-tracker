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
      .select("date, meal_type, person_count, meal_items(name, kcal, protein_g, fat_g, carb_g, fiber_g, sodium_mg, sugar_g, calcium_mg)")
      .eq("user_id", auth.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const header = ["date","meal_type","food","kcal","protein_g","fat_g","carb_g","fiber_g","sodium_mg","sugar_g","calcium_mg","person_count"];
    const rows: string[][] = [header];

    for (const meal of meals ?? []) {
      for (const item of meal.meal_items ?? []) {
        rows.push([
          meal.date,
          meal.meal_type,
          String(item.name ?? ""),
          String(item.kcal ?? ""),
          String(item.protein_g ?? ""),
          String(item.fat_g ?? ""),
          String(item.carb_g ?? ""),
          String(item.fiber_g ?? ""),
          String(item.sodium_mg ?? ""),
          String(item.sugar_g ?? ""),
          String(item.calcium_mg ?? ""),
          String(meal.person_count ?? ""),
        ]);
      }
    }

    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=meals-${month}.csv`,
      },
    });
  } catch (err) {
    console.error("[/api/export/meals]", err);
    return NextResponse.json({ error: "服务端错误" }, { status: 500 });
  }
}
