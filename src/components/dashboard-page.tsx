"use client";

import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { useSupabaseSession, createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MealCard } from "@/components/meals/meal-card";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { DateCalendar } from "@/components/date-calendar";
import {
  type SummaryMeal, type SummaryResponse, type MonitoringData,
  mealTypeLabel, DAILY_REFERENCE, NutrientRow, formatDate, localDateStr,
} from "@/components/dashboard-types";

export function DashboardPage() {
  const { session, loading } = useSupabaseSession();

  const authFetch = async (url: string, init?: RequestInit) => {
    const { data: sessData } = await createSupabaseBrowserClient().auth.getSession();
    const token = sessData.session?.access_token;
    return fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  };

  const [todaySummary, setTodaySummary] = useState<SummaryResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const mealOrder = ["breakfast","lunch","dinner","snack"] as const;
  const mealRank = Object.fromEntries(mealOrder.map((m,i)=>[m,i]));
  const sortMeals = (arr: SummaryMeal[]) => [...arr].sort((a,b)=>((mealRank[a.meal_type]??9)-(mealRank[b.meal_type]??9)) || a.created_at.localeCompare(b.created_at));
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState<MonitoringData>(null);
  const [monthlyData, setMonthlyData] = useState<MonitoringData>(null);
  const [lastWeekData, setLastWeekData] = useState<MonitoringData>(null);
  const [lastMonthData, setLastMonthData] = useState<MonitoringData>(null);
  const [trendsSeries, setTrendsSeries] = useState<{date:string;kcal:number;protein_g:number;fat_g:number;carb_g:number;fiber_g:number;sodium_mg:number;sugar_g:number;calcium_mg:number}[]>([]);
  const [monthMealMap, setMonthMealMap] = useState<Record<string, number>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayMeals, setDayMeals] = useState<SummaryResponse | null>(null);
  const [dayLoading, setDayLoading] = useState(false);

  // User-customizable reference targets
  const [refTargets, setRefTargets] = useState(DAILY_REFERENCE);

  const monthBase = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const weekDates = useMemo(() => {
    const dates: { dateStr: string; label: string; dayOfWeek: number }[] = [];
    const year = monthBase.getFullYear();
    const month = monthBase.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.max(35, startWeekday + daysInMonth);
    const rows = Math.ceil(totalCells / 7) * 7;
    for (let i = 0; i < rows; i++) {
      const dayNum = i - startWeekday + 1;
      const d = new Date(year, month, dayNum);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push({ dateStr: `${y}-${m}-${dd}`, label: String(d.getDate()), dayOfWeek: i % 7 });
    }
    return dates;
  }, [monthBase]);

  // Fetch user settings for custom targets
  useEffect(() => {
    if (!session?.user) return;
    authFetch(`/api/settings?user_id=${session.user.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setRefTargets({
            ...DAILY_REFERENCE,
            kcal: d.daily_kcal_target ?? DAILY_REFERENCE.kcal,
            protein_g: d.daily_protein_target ?? DAILY_REFERENCE.protein_g,
            fat_g: d.daily_fat_target ?? DAILY_REFERENCE.fat_g,
            carb_g: d.daily_carb_target ?? DAILY_REFERENCE.carb_g,
            fiber_g: d.daily_fiber_target ?? DAILY_REFERENCE.fiber_g,
          });
        }
      })
      .catch(() => {});
  }, [session?.user]);

  // Fetch monitoring data
  useEffect(() => {
    if (!session?.user) return;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => localDateStr(d);
    const startDate = fmt(monday);
    const endDate = fmt(sunday);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    authFetch(`/api/summary/weekly?user_id=${session.user.id}&start_date=${startDate}&end_date=${endDate}`)
      .then((r) => r.json()).then((d) => setWeeklyData(d)).catch(() => setWeeklyData(null));
    authFetch(`/api/summary/monthly?user_id=${session.user.id}&month=${currentMonth}`)
      .then((r) => r.json()).then((d) => setMonthlyData(d)).catch(() => setMonthlyData(null));

    const lastMonday = new Date(monday); lastMonday.setDate(monday.getDate() - 7);
    const lastSunday = new Date(lastMonday); lastSunday.setDate(lastMonday.getDate() + 6);
    authFetch(`/api/summary/weekly?user_id=${session.user.id}&start_date=${fmt(lastMonday)}&end_date=${fmt(lastSunday)}`)
      .then((r) => r.json()).then((d) => setLastWeekData(d)).catch(() => setLastWeekData(null));

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    authFetch(`/api/summary/monthly?user_id=${session.user.id}&month=${lastMonthStr}`)
      .then((r) => r.json()).then((d) => setLastMonthData(d)).catch(() => setLastMonthData(null));

    authFetch(`/api/summary/trends?month=${currentMonth}`)
      .then((r) => r.json()).then((d) => setTrendsSeries(d.series ?? [])).catch(() => setTrendsSeries([]));
  }, [session?.user]);

  // Fetch month calendar dots
  useEffect(() => {
    if (!session?.user) return;
    const monthStr = `${monthBase.getFullYear()}-${String(monthBase.getMonth() + 1).padStart(2, '0')}`;
    authFetch(`/api/summary/month-meals?user_id=${session.user.id}&month=${monthStr}`)
      .then((r) => r.json()).then((d) => setMonthMealMap(d.date_meal_count ?? {})).catch(() => setMonthMealMap({}));
  }, [session?.user, monthBase]);

  // Fetch today data
  useEffect(() => {
    if (!session?.user) return;
    const date = localDateStr(new Date());
    authFetch(`/api/summary/daily?user_id=${session.user.id}&date=${date}`)
      .then((r) => r.json()).then((d: SummaryResponse) => setTodaySummary(d)).catch(() => {});
  }, [session?.user]);

  // Fetch selected day data
  useEffect(() => {
    if (!selectedDay || !session?.user) return;
    setDayLoading(true);
    authFetch(`/api/summary/daily?user_id=${session.user.id}&date=${selectedDay}`)
      .then((r) => r.json()).then((d: SummaryResponse) => setDayMeals(d)).catch(() => setDayMeals(null))
      .finally(() => setDayLoading(false));
  }, [selectedDay, session?.user]);

  const handleDelete = async (mealId: string) => {
    if (!session?.user) return;
    if (!confirm("确定要删除这条饮食记录吗？")) return;
    setDeletingId(mealId);
    try {
      const res = await authFetch(`/api/meals/${mealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");

      const now = new Date();
      const todayStr = localDateStr(now);
      authFetch(`/api/summary/daily?user_id=${session.user.id}&date=${todayStr}`)
        .then((r) => r.json()).then((d: SummaryResponse) => setTodaySummary(d)).catch(() => {});
      if (selectedDay) {
        authFetch(`/api/summary/daily?user_id=${session.user.id}&date=${selectedDay}`)
          .then((r) => r.json()).then((d: SummaryResponse) => setDayMeals(d)).catch(() => {});
      }
      const monthStr = `${monthBase.getFullYear()}-${String(monthBase.getMonth() + 1).padStart(2, '0')}`;
      authFetch(`/api/summary/month-meals?user_id=${session.user.id}&month=${monthStr}`)
        .then((r) => r.json()).then((d) => setMonthMealMap(d.date_meal_count ?? {})).catch(() => {});
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMonthNav = (dir: number) => {
    setMonthOffset((prev) => prev + dir);
    setSelectedDay(null);
    setDayMeals(null);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDay((prev) => (prev === dateStr ? null : dateStr));
  };

  const todayMeals = sortMeals(todaySummary?.meals ?? []);
  const todaySummaryData = todaySummary?.summary ?? {
    total_kcal: 0, total_protein_g: 0, total_fat_g: 0, total_carb_g: 0,
    total_fiber_g: 0, total_saturated_fat_g: 0, total_sodium_mg: 0,
    total_calcium_mg: 0, total_iron_mg: 0, total_vitamin_c_mg: 0,
    total_vitamin_a_mcg: 0, total_sugar_g: 0, total_cholesterol_mg: 0,
  };

  // Helper to render a monitoring card
  const renderMonitoringCard = (title: string, subtitle: string, data: MonitoringData, okLabel: string) => (
    <div className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">{subtitle}</p>
      {data?.totals && data.days_with_data > 0 ? (
        <div className="mt-4 space-y-3">
          <NutrientRow label="能量" value={Math.round(data.totals.total_kcal / data.days_with_data)} refKey="kcal" unit="kcal" color="bg-[#1f5e4b]" reference={refTargets.kcal} />
          <NutrientRow label="蛋白质" value={Math.round(data.totals.total_protein_g / data.days_with_data)} refKey="protein_g" unit="g" color="bg-[#2563eb]" reference={refTargets.protein_g} />
          <NutrientRow label="脂肪" value={Math.round(data.totals.total_fat_g / data.days_with_data)} refKey="fat_g" unit="g" color="bg-[#d97706]" reference={refTargets.fat_g} />
          <NutrientRow label="碳水" value={Math.round(data.totals.total_carb_g / data.days_with_data)} refKey="carb_g" unit="g" color="bg-[#7c3aed]" reference={refTargets.carb_g} />
          <NutrientRow label="膳食纤维" value={Math.round(data.totals.total_fiber_g / data.days_with_data)} refKey="fiber_g" unit="g" color="bg-[#059669]" reference={refTargets.fiber_g} />
          <NutrientRow label="钠" value={Math.round(data.totals.total_sodium_mg / data.days_with_data)} refKey="sodium_mg" unit="mg" color="bg-[#dc2626]" />
          <NutrientRow label="糖" value={Math.round(data.totals.total_sugar_g / data.days_with_data)} refKey="sugar_g" unit="g" color="bg-[#ea580c]" />
          <NutrientRow label="钙" value={Math.round(data.totals.total_calcium_mg / data.days_with_data)} refKey="calcium_mg" unit="mg" color="bg-[#0891b2]" />
          <NutrientRow label="铁" value={Math.round(data.totals.total_iron_mg / data.days_with_data)} refKey="iron_mg" unit="mg" color="bg-[#be185d]" />
          <NutrientRow label="维生素C" value={Math.round(data.totals.total_vitamin_c_mg / data.days_with_data)} refKey="vitamin_c_mg" unit="mg" color="bg-[#65a30d]" />
          <NutrientRow label="维生素A" value={Math.round(data.totals.total_vitamin_a_mcg / data.days_with_data)} refKey="vitamin_a_mcg" unit="μg" color="bg-[#c026d3]" />
        </div>
      ) : <div className="mt-4 text-sm text-[#5a615c] dark:text-[#9ca3af]">暂无数据</div>}
      {data?.issues && data.issues.length > 0 ? (
        <div className="mt-5 space-y-2">
          {data.issues.map((issue, i) => <div key={i} className="rounded-2xl bg-[#fff7ed] dark:bg-[#2a2216] p-3 text-xs text-[#9a3412] dark:text-[#fb923c]">⚠️ {issue}</div>)}
        </div>
      ) : data?.days_with_data ? <div className="mt-5 rounded-2xl bg-[#f0fdf4] dark:bg-[#122117] p-3 text-xs text-[#166534] dark:text-[#86efac]">✅ {okLabel}</div> : null}
    </div>
  );

  const mealCardItems = (meal: SummaryMeal) => (meal.meal_items ?? []).map((item) => ({
    name: item.name,
    kcal: Number(item.kcal ?? 0), protein_g: Number(item.protein_g ?? 0), fat_g: Number(item.fat_g ?? 0), carb_g: Number(item.carb_g ?? 0),
    fiber_g: item.fiber_g != null ? Number(item.fiber_g) : undefined,
    saturated_fat_g: item.saturated_fat_g != null ? Number(item.saturated_fat_g) : undefined,
    sodium_mg: item.sodium_mg != null ? Number(item.sodium_mg) : undefined,
    calcium_mg: item.calcium_mg != null ? Number(item.calcium_mg) : undefined,
    iron_mg: item.iron_mg != null ? Number(item.iron_mg) : undefined,
    vitamin_c_mg: item.vitamin_c_mg != null ? Number(item.vitamin_c_mg) : undefined,
    vitamin_a_mcg: item.vitamin_a_mcg != null ? Number(item.vitamin_a_mcg) : undefined,
    sugar_g: item.sugar_g != null ? Number(item.sugar_g) : undefined,
    cholesterol_mg: item.cholesterol_mg != null ? Number(item.cholesterol_mg) : undefined,
    portion_grams: item.portion_grams != null ? Number(item.portion_grams) : undefined,
    food_group: item.food_group ?? undefined,
    dietary_advice: item.dietary_advice ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
      <header className="relative border-b border-[#e4e5e1] dark:border-[#2d3b36] bg-white/80 dark:bg-[#1a2120]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">Daily Meal</Link>
          <div className="hidden items-center gap-3 text-sm text-[#5a615c] dark:text-[#9ca3af] sm:flex">
            <Link href="/" className="hover:text-[#141613] dark:hover:text-[#e8e6e0]">今日</Link>
            <Link href="/meals/upload" className="hover:text-[#141613] dark:hover:text-[#e8e6e0]">记录饮食</Link>
            <Link href="/settings" className="hover:text-[#141613] dark:hover:text-[#e8e6e0]">设置</Link>
            {session?.user?.email ? <Link href="/profile" className="hover:text-[#141613] dark:hover:text-[#e8e6e0] hover:underline">{session.user.email}</Link> : null}
            <ThemeToggle />
            <button type="button" onClick={async () => { await createSupabaseBrowserClient().auth.signOut(); window.location.href = "/"; }} className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-[#5a615c] dark:text-[#9ca3af] transition hover:border-[#c8c4b8] hover:text-[#141613] dark:hover:text-[#e8e6e0]">退出</button>
          </div>
          <MobileNav email={session?.user?.email} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-6 space-y-5">
        {/* Today summary */}
        <section className="overflow-hidden rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-sm text-[#5a615c] dark:text-[#9ca3af]">今日概览</p>
              {loading ? <p className="mt-2 text-sm text-[#5a615c] dark:text-[#9ca3af]">正在加载...</p> : (
                <>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight">{Math.round(todaySummaryData.total_kcal)} kcal</h2>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
                    {([
                      { label: "蛋白质", value: todaySummaryData.total_protein_g, unit: "g" },
                      { label: "脂肪", value: todaySummaryData.total_fat_g, unit: "g" },
                      { label: "碳水", value: todaySummaryData.total_carb_g, unit: "g" },
                      { label: "膳食纤维", value: todaySummaryData.total_fiber_g, unit: "g" },
                      { label: "饱和脂肪", value: todaySummaryData.total_saturated_fat_g, unit: "g" },
                      { label: "钠", value: todaySummaryData.total_sodium_mg, unit: "mg" },
                      { label: "钙", value: todaySummaryData.total_calcium_mg, unit: "mg" },
                      { label: "铁", value: todaySummaryData.total_iron_mg, unit: "mg" },
                      { label: "维生素C", value: todaySummaryData.total_vitamin_c_mg, unit: "mg" },
                      { label: "维生素A", value: todaySummaryData.total_vitamin_a_mcg, unit: "μg" },
                      { label: "糖", value: todaySummaryData.total_sugar_g, unit: "g" },
                      { label: "胆固醇", value: todaySummaryData.total_cholesterol_mg, unit: "mg" },
                    ]).map(({ label, value, unit }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[#5a615c] dark:text-[#9ca3af]">{label}</span>
                        <span className="font-medium">{Math.round(value)}{unit}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/meals/upload" className="rounded-2xl bg-[#1f5e4b] dark:bg-[#4ade80] px-4 py-2 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#22c55e] transition shrink-0 self-start">上传饮食</Link>
          </div>
        </section>

        {/* Today meals */}
        {todayMeals.length === 0 ? (
          <div className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 text-center text-sm text-[#5a615c] dark:text-[#9ca3af] shadow-sm">
            <p className="text-base font-medium text-[#141613] dark:text-[#e8e6e0]">今天还没有记录</p>
            <p className="mt-2">先拍一张食物照片或手动录入，建立今天的第一条饮食记录。</p>
          </div>
        ) : todayMeals.map((meal) => (
          <MealCard key={meal.id} title={mealTypeLabel[meal.meal_type] ?? meal.meal_type} time={new Date(meal.created_at).toLocaleTimeString()} photoUrl={meal.photo_url} photoUrls={meal.photo_urls ?? undefined} items={mealCardItems(meal)} personCount={meal.person_count} mealAdvice={meal.meal_advice} dietaryStructureAdvice={meal.dietary_structure_advice} onDelete={() => handleDelete(meal.id)} deleting={deletingId === meal.id} />
        ))}

        {/* Trends + report + export */}
        <section className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">本月营养趋势</h3>
            <div className="flex gap-2">
              <button type="button" onClick={async () => {
                const month = `${monthBase.getFullYear()}-${String(monthBase.getMonth() + 1).padStart(2, "0")}`;
                const res = await authFetch(`/api/report/monthly?month=${month}`);
                const json = await res.json();
                alert(json.summary ?? "暂无报告");
              }} className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-sm text-[#5a615c] dark:text-[#9ca3af]">生成月报告</button>
              <button type="button" onClick={async () => {
                const month = `${monthBase.getFullYear()}-${String(monthBase.getMonth() + 1).padStart(2, "0")}`;
                const res = await authFetch(`/api/export/meals?month=${month}`);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `meals-${month}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }} className="rounded-full border border-[#1f5e4b] dark:border-[#4ade80] px-3 py-1.5 text-sm text-[#1f5e4b] dark:text-[#4ade80]">导出本月数据</button>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="kcal" name="能量" stroke="#1f5e4b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="protein_g" name="蛋白质" stroke="#2563eb" dot={false} />
                <Line type="monotone" dataKey="fat_g" name="脂肪" stroke="#d97706" dot={false} />
                <Line type="monotone" dataKey="carb_g" name="碳水" stroke="#7c3aed" dot={false} />
                <Line type="monotone" dataKey="sodium_mg" name="钠" stroke="#dc2626" dot={false} />
                <Line type="monotone" dataKey="fiber_g" name="膳食纤维" stroke="#059669" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Monitoring cards */}
        <section className="grid gap-6 md:grid-cols-2">
          {renderMonitoringCard("本周摄入监控", `记录 ${weeklyData?.days_with_data ?? 0} 天 / 日均摄入占比`, weeklyData, "本周饮食状态良好")}
          {renderMonitoringCard("本月摄入监控", `记录 ${monthlyData?.days_with_data ?? 0} 天 / 日均摄入占比`, monthlyData, "本月饮食状态良好")}
        </section>
        <section className="grid gap-6 md:grid-cols-2">
          {renderMonitoringCard("上周摄入监控", `记录 ${lastWeekData?.days_with_data ?? 0} 天 / 日均摄入占比`, lastWeekData, "上周饮食状态良好")}
          {renderMonitoringCard("上月摄入监控", `记录 ${lastMonthData?.days_with_data ?? 0} 天 / 日均摄入占比`, lastMonthData, "上月饮食状态良好")}
        </section>

        {/* Calendar */}
        <section className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold tracking-tight">{monthBase.getFullYear()}年{monthBase.getMonth() + 1}月 饮食日历</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => handleMonthNav(-1)} className="rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:bg-white dark:hover:bg-[#243029] transition">← 上月</button>
              <button type="button" onClick={() => handleMonthNav(1)} className="rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:bg-white dark:hover:bg-[#243029] transition">下月 →</button>
            </div>
          </div>
          <p className="mt-1 mb-4 text-sm text-[#5a615c] dark:text-[#9ca3af]">点击日期查看详细记录</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map(({ dateStr, label, dayOfWeek }) => {
              const today = new Date(); const todayStr = localDateStr(today);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;
              return (
                <button key={dateStr} type="button" onClick={() => handleDayClick(dateStr)} className={`relative flex flex-col items-center rounded-2xl border py-3 text-sm transition ${isSelected ? "border-[#1f5e4b] dark:border-[#4ade80] bg-[#1f5e4b] dark:bg-[#4ade80] text-white dark:text-[#0f1412]" : isToday ? "border-[#1f5e4b] dark:border-[#4ade80] bg-[#f0f6f4] dark:bg-[#1e2b27] text-[#1f5e4b] dark:text-[#4ade80]" : "border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52]"}`}>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-white/70 dark:text-[#0f1412]/60' : 'text-[#5a615c] dark:text-[#9ca3af]'}`}>{["日","一","二","三","四","五","六"][dayOfWeek]}</span>
                  <span className="mt-0.5 text-sm font-medium">{label}</span>
                  {monthMealMap[dateStr] ? <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-[#0f1412]' : 'bg-[#1f5e4b] dark:bg-[#4ade80]'}`} /> : null}
                </button>
              );
            })}
          </div>

          {selectedDay && (
            <div className="mt-5 rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#151e1b] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-base font-semibold tracking-tight">{formatDate(selectedDay)}</h4>
                <button type="button" onClick={() => { setSelectedDay(null); setDayMeals(null); }} className="rounded-lg border border-[#e4e5e1] dark:border-[#2d3b36] px-2.5 py-1 text-xs text-[#5a615c] dark:text-[#9ca3af] hover:text-[#141613] dark:hover:text-[#e8e6e0] transition">收起</button>
              </div>
              {dayLoading ? <div className="py-8 text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">加载中...</div>
               : dayMeals && dayMeals.meals.length > 0 ? (
                <div className="space-y-3">
                  {sortMeals(dayMeals.meals).map((meal) => (
                    <MealCard key={meal.id} title={mealTypeLabel[meal.meal_type] ?? meal.meal_type} time={new Date(meal.created_at).toLocaleTimeString()} photoUrl={meal.photo_url} photoUrls={meal.photo_urls ?? undefined} items={mealCardItems(meal)} personCount={meal.person_count} mealAdvice={meal.meal_advice} dietaryStructureAdvice={meal.dietary_structure_advice} onDelete={() => handleDelete(meal.id)} deleting={deletingId === meal.id} />
                  ))}
                </div>
              ) : <p className="py-8 text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">该日无饮食记录</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
