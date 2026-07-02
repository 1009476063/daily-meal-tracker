import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const month = searchParams.get("month"); // YYYY-MM

    if (!userId || !month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "缺少 user_id 或 month(YYYY-MM)" }, { status: 400 });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-${String(new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate()).padStart(2, "0")}`;

    const supabase = createSupabaseServerClient();

    const { data: meals, error } = await supabase
      .from("meal_meals")
      .select("date")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const dateMealCount: Record<string, number> = {};
    for (const meal of meals ?? []) {
      dateMealCount[meal.date] = (dateMealCount[meal.date] || 0) + 1;
    }

    return NextResponse.json({ month, date_meal_count: dateMealCount });
  } catch (err) {
    console.error("[/api/summary/month-meals]", err);
    return NextResponse.json({ error: "服务端错误", date_meal_count: {} }, { status: 500 });
  }
}
