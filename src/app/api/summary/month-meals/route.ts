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
      .select("date")
      .eq("user_id", auth.user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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
