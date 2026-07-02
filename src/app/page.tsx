"use client";

import React, { useEffect, useState, useMemo } from"react";
import Link from"next/link";
import { useSupabaseSession } from"@/lib/supabase-browser";
import { MealCard } from"@/components/meals/meal-card";
import { MobileNav } from"@/components/layout/mobile-nav";
import { ThemeToggle } from"@/components/theme-toggle";

type SummaryMeal = {
 id: string;
 meal_type: string;
 created_at: string;
 photo_url: string | null;
 photo_urls?: string[] | null;
 person_count: number;
 meal_advice: string | null;
 dietary_structure_advice: string | null;
 meal_items: {
 name: string;
 kcal: number | null;
 protein_g: number | null;
 fat_g: number | null;
 carb_g: number | null;
 fiber_g?: number | null;
 saturated_fat_g?: number | null;
 sodium_mg?: number | null;
 calcium_mg?: number | null;
 iron_mg?: number | null;
 vitamin_c_mg?: number | null;
 vitamin_a_mcg?: number | null;
 sugar_g?: number | null;
 cholesterol_mg?: number | null;
 portion_grams?: number | null;
 food_group?: string | null;
 dietary_advice?: string | null;
 }[];
};

type SummaryResponse = {
 date: string;
 meals: SummaryMeal[];
 summary: {
 total_kcal: number;
 total_protein_g: number;
 total_fat_g: number;
 total_carb_g: number;
 total_fiber_g: number;
 total_saturated_fat_g: number;
 total_sodium_mg: number;
 total_calcium_mg: number;
 total_iron_mg: number;
 total_vitamin_c_mg: number;
 total_vitamin_a_mcg: number;
 total_sugar_g: number;
 total_cholesterol_mg: number;
 };
};

const mealTypeLabel: Record<string, string> = {
 breakfast:"早餐",
 lunch:"午餐",
 dinner:"晚餐",
 snack:"加餐",
};

const weekDays = ["日","一","二","三","四","五","六"];

// 中国居民膳食营养素参考摄入量（成人，每日）
const DAILY_REFERENCE = {
 kcal: 2000,
 protein_g: 65,
 fat_g: 60,
 carb_g: 300,
 fiber_g: 25,
 sodium_mg: 2000,
 sugar_g: 50,
 saturated_fat_g: 20,
 calcium_mg: 800,
 iron_mg: 15,
 vitamin_c_mg: 100,
 vitamin_a_mcg: 800,
 cholesterol_mg: 300,
} as const;

type NutrientKey = keyof typeof DAILY_REFERENCE;

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
 const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
 const over = pct > 100;
 return (
 <div className="flex items-center gap-2">
 <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#e4e5e1]">
 <div
 className={`absolute left-0 top-0 h-full rounded-full transition-all ${over ? 'bg-[#b91c1c]' : color}`}
 style={{ width: `${Math.min(pct, 100)}%` }}
 />
 </div>
 <span className={`w-12 text-right text-[11px] ${over ? 'text-[#b91c1c] dark:text-[#f87171] font-semibold' : 'text-[#5a615c] dark:text-[#9ca3af] '}`}>
 {pct}%
 </span>
 </div>
 );
}

function NutrientRow({ label, value, refKey, unit, color }: { label: string; value: number; refKey: NutrientKey; unit: string; color: string }) {
 return (
 <div className="space-y-1">
 <div className="flex items-center justify-between text-xs">
 <span className="text-[#5a615c] dark:text-[#9ca3af]">{label}</span>
 <span className="text-[#141613] dark:text-[#e8e6e0]">{Math.round(value)}{unit} <span className="text-[#b9b5a5] dark:text-[#6b7280]">/ {DAILY_REFERENCE[refKey]}{unit}</span></span>
 </div>
 <ProgressBar value={value} max={DAILY_REFERENCE[refKey]} color={color} />
 </div>
 );
}

function formatDate(dateStr: string): string {
 const d = new Date(dateStr +"T00:00:00");
 return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
 return (
 <div className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 transition hover:shadow-md">
 <div className="text-2xl">{icon}</div>
 <h3 className="mt-3 text-[16px] font-semibold text-[#141613] dark:text-[#e8e6e0]">{title}</h3>
 <p className="mt-2 text-[13px] leading-relaxed text-[#5a615c] dark:text-[#9ca3af]">{desc}</p>
 </div>
 );
}

function LandingPage() {
 const steps = [
 { title:"多图上传", description:"支持同时上传多张食物照片，从不同角度拍摄同一餐食，AI 综合分析。" },
 { title:"AI 精准识别", description:"基于中国食物成分表，识别菜名、食材、份量，计算 13 项营养指标。" },
 { title:"营养追踪", description:"月日历记录、日/周/月监控卡、进度条对比中国膳食指南推荐量。" },
 ];

 const features = [
 { icon:"📸", title:"多图识别", desc:"支持每餐上传多张照片，AI 综合多角度图片精准识别食物和份量。" },
 { icon:"🔬", title:"13 项营养指标", desc:"能量、蛋白质、脂肪、碳水、膳食纤维、饱和脂肪、钠、钙、铁、维生素A/C、糖、胆固醇，全面覆盖。" },
 { icon:"🤖", title:"自定义 AI 模型", desc:"支持配置不同的 AI 服务和模型（GPT-4o、Claude 等），一键测试连接。" },
 { icon:"👥", title:"多人食识别", desc:"AI 自动判断用餐人数，支持手动调整，按人数准确估算营养总量。" },
 { icon:"📅", title:"月日历视图", desc:"按月查看饮食记录，点击任一天查看详细数据，记录圆点一目了然。" },
 { icon:"📊", title:"多维度监控", desc:"本周、上周、本月、上月四维摄入监控，进度条对比每日推荐摄入量。" },
 { icon:"🥗", title:"搭配建议", desc:"每餐提供食物搭配建议和饮食结构分析，指出缺少的食物类别。" },
 { icon:"⚠️", title:"健康预警", desc:"自动检测钠超标、蛋白质不足、膳食纤维偏低等问题，及时提醒修正。" },
 { icon:"⚙️", title:"个性化设置", desc:"自定义每日营养目标、AI 接口配置，打造专属饮食管理方案。" },
 ];

 return (
 <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
 <header className="sticky top-0 z-10 border-b border-[#e4e5e1]/70 dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412]/80 backdrop-blur">
 <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
 <span className="text-lg font-semibold tracking-tight">Daily Meal</span>
 <div className="flex items-center gap-2 text-sm">
 <Link href="/login" className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-4 py-2 text-[#5a615c] dark:text-[#9ca3af] hover:text-[#141613] dark:hover:text-[#f0eeea]">登录</Link>
 <Link href="/register" className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-4 py-2 text-white hover:bg-[#17493b] dark:hover:bg-[#14532d]">注册</Link>
 </div>
 </div>
 </header>
 <main>
 {/* Hero */}
 <section className="mx-auto max-w-5xl px-5 pb-16 pt-20 text-center md:pb-20 md:pt-28">
 <span className="inline-block rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-3 py-1 text-[12px] font-medium text-[#5a615c] dark:text-[#9ca3af]">每日饮食记录 · AI 精准识别 · 13 项营养指标</span>
 <h1 className="mx-auto mt-7 max-w-2xl text-[34px] font-semibold leading-[1.15] tracking-tight text-[#141613] dark:text-[#e8e6e0] sm:text-[44px]">
 记录每一餐，<span className="text-[#1f5e4b] dark:text-[#4ade80]">让营养更清晰</span>
 </h1>
 <p className="mx-auto mt-6 max-w-prose text-[15px] leading-relaxed text-[#5a615c] dark:text-[#9ca3af]">
 Daily Meal Tracker 帮你用照片快速建立饮食记录，基于《中国食物成分表》AI 精准识别食物并计算 13 项营养指标，提供搭配建议和健康预警，让你全面掌握每日营养摄入。
 </p>
 <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
 <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#17493b] dark:hover:bg-[#14532d]">立即开始记录</Link>
 <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-6 py-2.5 text-sm font-medium text-[#141613] dark:text-[#e8e6e0] transition hover:bg-[#faf9f5] dark:hover:bg-[#0f1412] dark:hover:bg-[#151e1b]">已有账号登录</Link>
 </div>
 </section>

 {/* Steps */}
 <section className="px-5 pb-16 md:pb-20">
 <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-8 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] md:p-12">
 <div className="text-center">
 <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a615c] dark:text-[#9ca3af]">核心流程</span>
 <h2 className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-tight text-[#141613] dark:text-[#e8e6e0] md:text-[32px]">三步完成一份<span className="text-[#1f5e4b] dark:text-[#4ade80]">完整记录</span></h2>
 </div>
 <div className="mt-10 grid gap-6 md:grid-cols-3">
 {steps.map((step, i) => (
 <div key={step.title} className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#ffffff] dark:bg-[#1a2120] p-5">
 <div className="font-mono text-[13px] text-[#1f5e4b] dark:text-[#4ade80]">{String(i + 1).padStart(2,"0")}</div>
 <h3 className="mt-3 text-[18px] font-semibold text-[#141613] dark:text-[#e8e6e0]">{step.title}</h3>
 <p className="mt-2 text-[13px] leading-relaxed text-[#5a615c] dark:text-[#9ca3af]">{step.description}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Features Grid */}
 <section className="px-5 pb-16 md:pb-20">
 <div className="mx-auto max-w-5xl">
 <div className="text-center">
 <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a615c] dark:text-[#9ca3af]">产品特性</span>
 <h2 className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-tight text-[#141613] dark:text-[#e8e6e0] md:text-[32px]">全面的<span className="text-[#1f5e4b] dark:text-[#4ade80]">营养管理</span>能力</h2>
 <p className="mx-auto mt-3 max-w-prose text-[14px] text-[#5a615c] dark:text-[#9ca3af]">基于中国居民膳食指南和食物成分表，覆盖从识别到追踪的完整链路</p>
 </div>
 <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {features.map((f) => (
 <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
 ))}
 </div>
 </div>
 </section>

 {/* Nutrition Indicators */}
 <section className="px-5 pb-16 md:pb-20">
 <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-8 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] md:p-12">
 <div className="text-center">
 <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a615c] dark:text-[#9ca3af]">营养指标</span>
 <h2 className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-tight text-[#141613] dark:text-[#e8e6e0] md:text-[32px]">13 项<span className="text-[#1f5e4b] dark:text-[#4ade80]">全面覆盖</span></h2>
 <p className="mx-auto mt-3 max-w-prose text-[14px] text-[#5a615c] dark:text-[#9ca3af]">参照《中国居民膳食营养素参考摄入量》标准，每餐自动计算</p>
 </div>
 <div className="mt-8 flex flex-wrap justify-center gap-3">
 {["能量","蛋白质","脂肪","碳水化合物","膳食纤维","饱和脂肪","钠","钙","铁","维生素C","维生素A","糖","胆固醇"].map((name) => (
 <span key={name} className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b] px-4 py-2 text-sm text-[#141613] dark:text-[#e8e6e0]">{name}</span>
 ))}
 </div>
 </div>
 </section>
 </main>
 <footer className="border-t border-[#e4e5e1] dark:border-[#2d3b36] bg-[#141613] px-5 py-10 text-center text-[#d5d3cb]">
 <div className="mx-auto max-w-5xl space-y-3">
 <div className="text-base font-semibold text-white">Daily Meal Tracker</div>
 <p className="text-[13px] leading-relaxed text-white/60">用照片记录饮食，用 AI 精准识别营养，让每一餐都更健康。</p>
 </div>
 </footer>
 </div>
 );
}

function DashboardPage() {
 const { session, loading } = useSupabaseSession();
 const [todaySummary, setTodaySummary] = useState<SummaryResponse | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);

 // History week navigation
 const [monthOffset, setMonthOffset] = useState(0);
 const [weeklyData, setWeeklyData] = useState<{ totals: Record<string, number>; issues: string[]; days_with_data: number } | null>(null);
 const [monthlyData, setMonthlyData] = useState<{ totals: Record<string, number>; issues: string[]; days_with_data: number } | null>(null);
 const [lastWeekData, setLastWeekData] = useState<{ totals: Record<string, number>; issues: string[]; days_with_data: number } | null>(null);
 const [lastMonthData, setLastMonthData] = useState<{ totals: Record<string, number>; issues: string[]; days_with_data: number } | null>(null);
 const [monthMealMap, setMonthMealMap] = useState<Record<string, number>>({});
 const [selectedDay, setSelectedDay] = useState<string | null>(null);
 const [dayMeals, setDayMeals] = useState<SummaryResponse | null>(null);
 const [dayLoading, setDayLoading] = useState(false);

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
 const dateStr = `${y}-${m}-${dd}`;
 dates.push({
 dateStr,
 label: String(d.getDate()),
 dayOfWeek: i % 7,
 });
 }

 return dates;
 }, [monthBase]);

 // Fetch weekly/monthly monitoring data
 useEffect(() => {
 if (!session?.user) return;
 const now = new Date();
 const dayOfWeek = now.getDay();
 const monday = new Date(now);
 monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
 const sunday = new Date(monday);
 sunday.setDate(monday.getDate() + 6);
 const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
 const startDate = fmt(monday);
 const endDate = fmt(sunday);
 const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

 fetch(`/api/summary/weekly?user_id=${session.user.id}&start_date=${startDate}&end_date=${endDate}`)
 .then((r) => r.json())
 .then((d) => setWeeklyData(d))
 .catch(() => setWeeklyData(null));

 fetch(`/api/summary/monthly?user_id=${session.user.id}&month=${currentMonth}`)
 .then((r) => r.json())
 .then((d) => setMonthlyData(d))
 .catch(() => setMonthlyData(null));

 // Last week
 const lastMonday = new Date(monday);
 lastMonday.setDate(monday.getDate() - 7);
 const lastSunday = new Date(lastMonday);
 lastSunday.setDate(lastMonday.getDate() + 6);
 fetch(`/api/summary/weekly?user_id=${session.user.id}&start_date=${fmt(lastMonday)}&end_date=${fmt(lastSunday)}`)
 .then((r) => r.json())
 .then((d) => setLastWeekData(d))
 .catch(() => setLastWeekData(null));

 // Last month
 const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
 const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
 fetch(`/api/summary/monthly?user_id=${session.user.id}&month=${lastMonthStr}`)
 .then((r) => r.json())
 .then((d) => setLastMonthData(d))
 .catch(() => setLastMonthData(null));
 }, [session?.user]);

 // Fetch meal presence map for current month calendar (batch)
 useEffect(() => {
 if (!session?.user) return;
 const y = monthBase.getFullYear();
 const m = monthBase.getMonth();
 const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
 fetch(`/api/summary/month-meals?user_id=${session.user.id}&month=${monthStr}`)
 .then((r) => r.json())
 .then((d) => setMonthMealMap(d.date_meal_count ?? {}))
 .catch(() => setMonthMealMap({}));
 }, [session?.user, monthBase]);

 // Fetch today data on mount
 useEffect(() => {
 if (!session?.user) return;
 const now = new Date();
 const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
 fetch(`/api/summary/daily?user_id=${session.user.id}&date=${date}`)
 .then((r) => r.json())
 .then((d: SummaryResponse) => setTodaySummary(d))
 .catch(() => {});
 }, [session?.user]);

 // Fetch selected day data
 useEffect(() => {
 if (!selectedDay || !session?.user) return;
 setDayLoading(true);
 fetch(`/api/summary/daily?user_id=${session.user.id}&date=${selectedDay}`)
 .then((r) => r.json())
 .then((d: SummaryResponse) => setDayMeals(d))
 .catch(() => setDayMeals(null))
 .finally(() => setDayLoading(false));
 }, [selectedDay, session?.user]);

 const handleDelete = async (mealId: string) => {
 if (!session?.user) return;
 if (!confirm("确定要删除这条饮食记录吗？")) return;
 setDeletingId(mealId);
 try {
 const res = await fetch(`/api/meals/${mealId}`, { method:"DELETE" });
 if (!res.ok) throw new Error("删除失败");

 // Refresh today summary
 const n = new Date();
 const todayStr = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
 fetch(`/api/summary/daily?user_id=${session.user.id}&date=${todayStr}`)
 .then((r) => r.json())
 .then((d: SummaryResponse) => setTodaySummary(d))
 .catch(() => {});

 // Refresh selected day detail if viewing a calendar day
 if (selectedDay) {
 fetch(`/api/summary/daily?user_id=${session.user.id}&date=${selectedDay}`)
 .then((r) => r.json())
 .then((d: SummaryResponse) => setDayMeals(d))
 .catch(() => {});
 }
 } catch (err) {
 alert(err instanceof Error ? err.message :"删除失败");
 } finally {
 setDeletingId(null);
 }
 };

 const todayMeals = todaySummary?.meals ?? [];
 const todaySummaryData = todaySummary?.summary ?? {
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
 };

 const handleMonthNav = (dir: number) => {
 setMonthOffset((prev) => prev + dir);
 setSelectedDay(null);
 setDayMeals(null);
 };

 const handleDayClick = (dateStr: string) => {
 setSelectedDay((prev) => (prev === dateStr ? null : dateStr));
 };

 return (
 <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
 {/* Header */}
 <header className="relative border-b border-[#e4e5e1] dark:border-[#2d3b36] bg-white/80 dark:bg-[#1a2120]/85 backdrop-blur-md">
 <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
 <Link href="/" className="text-lg font-semibold tracking-tight">Daily Meal</Link>

 {/* Desktop nav */}
 <div className="hidden items-center gap-3 text-sm text-[#5a615c] dark:text-[#9ca3af] sm:flex">
 <Link href="/" className="hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0]">今日</Link>
 <Link href="/meals/upload" className="hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0]">记录饮食</Link>
 <Link href="/settings" className="hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0]">设置</Link>
 {session?.user?.email ? <Link href="/profile" className="text-[#5a615c] dark:text-[#9ca3af] hover:text-[#141613] dark:hover:text-[#f0eeea] hover:underline">{session.user.email}</Link> : null}
 <ThemeToggle />
 <button
 type="button"
 onClick={async () => {
 const { createSupabaseBrowserClient } = await import("@/lib/supabase-browser");
 await createSupabaseBrowserClient().auth.signOut();
 window.location.href ="/";
 }}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-[#5a615c] dark:text-[#9ca3af] transition hover:border-[#c8c4b8] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:border-[#4a5a52] dark:hover:text-[#e8e6e0]"
 >
 退出
 </button>
 </div>

 {/* Mobile nav */}
 <MobileNav email={session?.user?.email} />
 </div>
 </header>

 <main className="mx-auto max-w-4xl px-5 py-8 space-y-8">
 {/* Today summary card */}
 <section className="overflow-hidden rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
 <div className="flex-1">
 <p className="text-sm text-[#5a615c] dark:text-[#9ca3af]">今日概览</p>
 {loading ? (
 <p className="mt-2 text-sm text-[#5a615c] dark:text-[#9ca3af]">正在加载...</p>
 ) : (
 <>
 <h2 className="mt-1 text-3xl font-semibold tracking-tight">
 {Math.round(todaySummaryData.total_kcal)} kcal
 </h2>
 <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
 {([
 { label:"蛋白质", value: todaySummaryData.total_protein_g, unit:"g" },
 { label:"脂肪", value: todaySummaryData.total_fat_g, unit:"g" },
 { label:"碳水", value: todaySummaryData.total_carb_g, unit:"g" },
 { label:"膳食纤维", value: todaySummaryData.total_fiber_g, unit:"g" },
 { label:"饱和脂肪", value: todaySummaryData.total_saturated_fat_g, unit:"g" },
 { label:"钠", value: todaySummaryData.total_sodium_mg, unit:"mg" },
 { label:"钙", value: todaySummaryData.total_calcium_mg, unit:"mg" },
 { label:"铁", value: todaySummaryData.total_iron_mg, unit:"mg" },
 { label:"维生素C", value: todaySummaryData.total_vitamin_c_mg, unit:"mg" },
 { label:"维生素A", value: todaySummaryData.total_vitamin_a_mcg, unit:"μg" },
 { label:"糖", value: todaySummaryData.total_sugar_g, unit:"g" },
 { label:"胆固醇", value: todaySummaryData.total_cholesterol_mg, unit:"mg" },
 ]).map(({ label, value, unit }) => (
 <div key={label} className="flex items-center justify-between">
 <span className="text-[#5a615c] dark:text-[#9ca3af]">{label}</span>
 <span className="font-medium text-[#141613] dark:text-[#e8e6e0]">{Math.round(value)}{unit}</span>
 </div>
 ))}
 </div>
 </>
 )}
 </div>
 <Link href="/meals/upload" className="rounded-2xl bg-[#1f5e4b] dark:bg-[#166534] dark:bg-[#4ade80] px-4 py-2 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#22c55e] transition shrink-0 self-start">
 上传饮食
 </Link>
 </div>
 </section>

 {/* Today meals */}
 {todayMeals.length === 0 ? (
 <div className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-8 text-center text-sm text-[#5a615c] dark:text-[#9ca3af] shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <p className="text-base font-medium text-[#141613] dark:text-[#e8e6e0]">今天还没有记录</p>
 <p className="mt-2">先拍一张食物照片或手动录入，建立今天的第一条饮食记录。</p>
 </div>
 ) : (
 todayMeals.map((meal) => (
 <MealCard
 key={meal.id}
 title={mealTypeLabel[meal.meal_type] ?? meal.meal_type}
 time={new Date(meal.created_at).toLocaleTimeString()}
 photoUrl={meal.photo_url}
 photoUrls={meal.photo_urls ?? undefined}
 items={(meal.meal_items ?? []).map((item) => ({
 name: item.name,
 kcal: Number(item.kcal ?? 0),
 protein_g: Number(item.protein_g ?? 0),
 fat_g: Number(item.fat_g ?? 0),
 carb_g: Number(item.carb_g ?? 0),
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
 }))}
 personCount={meal.person_count}
 mealAdvice={meal.meal_advice}
 dietaryStructureAdvice={meal.dietary_structure_advice}
 onDelete={() => handleDelete(meal.id)}
 deleting={deletingId === meal.id}
 />
 ))
 )}

 {/* Weekly & Monthly Monitoring */}
 <section className="grid gap-6 md:grid-cols-2">
 <div className="rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h3 className="text-lg font-semibold tracking-tight">本周摄入监控</h3>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">记录 {weeklyData?.days_with_data ?? 0} 天 / 日均摄入占比</p>
 {weeklyData?.totals && weeklyData.days_with_data > 0 ? (
 <div className="mt-4 space-y-3">
 <NutrientRow label="能量" value={Math.round(weeklyData.totals.total_kcal / weeklyData.days_with_data)} refKey="kcal" unit="kcal" color="bg-[#1f5e4b] dark:bg-[#166534]" />
 <NutrientRow label="蛋白质" value={Math.round(weeklyData.totals.total_protein_g / weeklyData.days_with_data)} refKey="protein_g" unit="g" color="bg-[#2563eb]" />
 <NutrientRow label="脂肪" value={Math.round(weeklyData.totals.total_fat_g / weeklyData.days_with_data)} refKey="fat_g" unit="g" color="bg-[#d97706]" />
 <NutrientRow label="碳水" value={Math.round(weeklyData.totals.total_carb_g / weeklyData.days_with_data)} refKey="carb_g" unit="g" color="bg-[#7c3aed]" />
 <NutrientRow label="膳食纤维" value={Math.round(weeklyData.totals.total_fiber_g / weeklyData.days_with_data)} refKey="fiber_g" unit="g" color="bg-[#059669]" />
 <NutrientRow label="钠" value={Math.round(weeklyData.totals.total_sodium_mg / weeklyData.days_with_data)} refKey="sodium_mg" unit="mg" color="bg-[#dc2626]" />
 <NutrientRow label="糖" value={Math.round(weeklyData.totals.total_sugar_g / weeklyData.days_with_data)} refKey="sugar_g" unit="g" color="bg-[#ea580c]" />
 <NutrientRow label="钙" value={Math.round(weeklyData.totals.total_calcium_mg / weeklyData.days_with_data)} refKey="calcium_mg" unit="mg" color="bg-[#0891b2]" />
 <NutrientRow label="铁" value={Math.round(weeklyData.totals.total_iron_mg / weeklyData.days_with_data)} refKey="iron_mg" unit="mg" color="bg-[#be185d]" />
 <NutrientRow label="维生素C" value={Math.round(weeklyData.totals.total_vitamin_c_mg / weeklyData.days_with_data)} refKey="vitamin_c_mg" unit="mg" color="bg-[#65a30d]" />
 <NutrientRow label="维生素A" value={Math.round(weeklyData.totals.total_vitamin_a_mcg / weeklyData.days_with_data)} refKey="vitamin_a_mcg" unit="μg" color="bg-[#c026d3]" /> </div>
 ) : (
 <div className="mt-4 text-sm text-[#5a615c] dark:text-[#9ca3af]">暂无数据</div>
 )}
 {weeklyData?.issues && weeklyData.issues.length > 0 ? (
 <div className="mt-5 space-y-2">
 {weeklyData.issues.map((issue, i) => (
 <div key={i} className="rounded-2xl bg-[#fff7ed] dark:bg-[#2a2216] p-3 text-xs text-[#9a3412] dark:text-[#fb923c]">⚠️ {issue}</div>
 ))}
 </div>
 ) : weeklyData?.days_with_data ? (
 <div className="mt-5 rounded-2xl bg-[#f0fdf4] dark:bg-[#122117] p-3 text-xs text-[#166534] dark:text-[#86efac]">✅ 本周饮食状态良好</div>
 ) : null}
 </div>

 {/* Monthly Card */}
 <div className="rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h3 className="text-lg font-semibold tracking-tight">本月摄入监控</h3>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">记录 {monthlyData?.days_with_data ?? 0} 天 / 日均摄入占比</p>
 {monthlyData?.totals && monthlyData.days_with_data > 0 ? (
 <div className="mt-4 space-y-3">
 <NutrientRow label="能量" value={Math.round(monthlyData.totals.total_kcal / monthlyData.days_with_data)} refKey="kcal" unit="kcal" color="bg-[#1f5e4b] dark:bg-[#166534]" />
 <NutrientRow label="蛋白质" value={Math.round(monthlyData.totals.total_protein_g / monthlyData.days_with_data)} refKey="protein_g" unit="g" color="bg-[#2563eb]" />
 <NutrientRow label="脂肪" value={Math.round(monthlyData.totals.total_fat_g / monthlyData.days_with_data)} refKey="fat_g" unit="g" color="bg-[#d97706]" />
 <NutrientRow label="碳水" value={Math.round(monthlyData.totals.total_carb_g / monthlyData.days_with_data)} refKey="carb_g" unit="g" color="bg-[#7c3aed]" />
 <NutrientRow label="膳食纤维" value={Math.round(monthlyData.totals.total_fiber_g / monthlyData.days_with_data)} refKey="fiber_g" unit="g" color="bg-[#059669]" />
 <NutrientRow label="钠" value={Math.round(monthlyData.totals.total_sodium_mg / monthlyData.days_with_data)} refKey="sodium_mg" unit="mg" color="bg-[#dc2626]" />
 <NutrientRow label="糖" value={Math.round(monthlyData.totals.total_sugar_g / monthlyData.days_with_data)} refKey="sugar_g" unit="g" color="bg-[#ea580c]" />
 <NutrientRow label="钙" value={Math.round(monthlyData.totals.total_calcium_mg / monthlyData.days_with_data)} refKey="calcium_mg" unit="mg" color="bg-[#0891b2]" />
 <NutrientRow label="铁" value={Math.round(monthlyData.totals.total_iron_mg / monthlyData.days_with_data)} refKey="iron_mg" unit="mg" color="bg-[#be185d]" />
 <NutrientRow label="维生素C" value={Math.round(monthlyData.totals.total_vitamin_c_mg / monthlyData.days_with_data)} refKey="vitamin_c_mg" unit="mg" color="bg-[#65a30d]" />
 <NutrientRow label="维生素A" value={Math.round(monthlyData.totals.total_vitamin_a_mcg / monthlyData.days_with_data)} refKey="vitamin_a_mcg" unit="μg" color="bg-[#c026d3]" /> </div>
 ) : (
 <div className="mt-4 text-sm text-[#5a615c] dark:text-[#9ca3af]">暂无数据</div>
 )}
 {monthlyData?.issues && monthlyData.issues.length > 0 ? (
 <div className="mt-5 space-y-2">
 {monthlyData.issues.map((issue, i) => (
 <div key={i} className="rounded-2xl bg-[#fff7ed] dark:bg-[#2a2216] p-3 text-xs text-[#9a3412] dark:text-[#fb923c]">⚠️ {issue}</div>
 ))}
 </div>
 ) : monthlyData?.days_with_data ? (
 <div className="mt-5 rounded-2xl bg-[#f0fdf4] dark:bg-[#122117] p-3 text-xs text-[#166534] dark:text-[#86efac]">✅ 本月饮食状态良好</div>
 ) : null}
 </div>
 </section>

 {/* Last Week & Last Month Monitoring */}
 <section className="grid gap-6 md:grid-cols-2">
 <div className="rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h3 className="text-lg font-semibold tracking-tight">上周摄入监控</h3>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">记录 {lastWeekData?.days_with_data ?? 0} 天 / 日均摄入占比</p>
 {lastWeekData?.totals && lastWeekData.days_with_data > 0 ? (
 <div className="mt-4 space-y-3">
 <NutrientRow label="能量" value={Math.round(lastWeekData.totals.total_kcal / lastWeekData.days_with_data)} refKey="kcal" unit="kcal" color="bg-[#1f5e4b] dark:bg-[#166534]" />
 <NutrientRow label="蛋白质" value={Math.round(lastWeekData.totals.total_protein_g / lastWeekData.days_with_data)} refKey="protein_g" unit="g" color="bg-[#2563eb]" />
 <NutrientRow label="脂肪" value={Math.round(lastWeekData.totals.total_fat_g / lastWeekData.days_with_data)} refKey="fat_g" unit="g" color="bg-[#d97706]" />
 <NutrientRow label="碳水" value={Math.round(lastWeekData.totals.total_carb_g / lastWeekData.days_with_data)} refKey="carb_g" unit="g" color="bg-[#7c3aed]" />
 <NutrientRow label="膳食纤维" value={Math.round(lastWeekData.totals.total_fiber_g / lastWeekData.days_with_data)} refKey="fiber_g" unit="g" color="bg-[#059669]" />
 <NutrientRow label="钠" value={Math.round(lastWeekData.totals.total_sodium_mg / lastWeekData.days_with_data)} refKey="sodium_mg" unit="mg" color="bg-[#dc2626]" />
 <NutrientRow label="糖" value={Math.round(lastWeekData.totals.total_sugar_g / lastWeekData.days_with_data)} refKey="sugar_g" unit="g" color="bg-[#ea580c]" />
 <NutrientRow label="钙" value={Math.round(lastWeekData.totals.total_calcium_mg / lastWeekData.days_with_data)} refKey="calcium_mg" unit="mg" color="bg-[#0891b2]" />
 <NutrientRow label="铁" value={Math.round(lastWeekData.totals.total_iron_mg / lastWeekData.days_with_data)} refKey="iron_mg" unit="mg" color="bg-[#be185d]" />
 <NutrientRow label="维生素C" value={Math.round(lastWeekData.totals.total_vitamin_c_mg / lastWeekData.days_with_data)} refKey="vitamin_c_mg" unit="mg" color="bg-[#65a30d]" />
 <NutrientRow label="维生素A" value={Math.round(lastWeekData.totals.total_vitamin_a_mcg / lastWeekData.days_with_data)} refKey="vitamin_a_mcg" unit="μg" color="bg-[#c026d3]" />
 </div>
 ) : (
 <div className="mt-4 text-sm text-[#5a615c] dark:text-[#9ca3af]">暂无数据</div>
 )}
 {lastWeekData?.issues && lastWeekData.issues.length > 0 ? (
 <div className="mt-5 space-y-2">
 {lastWeekData.issues.map((issue, i) => (
 <div key={i} className="rounded-2xl bg-[#fff7ed] dark:bg-[#2a2216] p-3 text-xs text-[#9a3412] dark:text-[#fb923c]">⚠️ {issue}</div>
 ))}
 </div>
 ) : lastWeekData?.days_with_data ? (
 <div className="mt-5 rounded-2xl bg-[#f0fdf4] dark:bg-[#122117] p-3 text-xs text-[#166534] dark:text-[#86efac]">✅ 上周饮食状态良好</div>
 ) : null}
 </div>

 <div className="rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h3 className="text-lg font-semibold tracking-tight">上月摄入监控</h3>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">记录 {lastMonthData?.days_with_data ?? 0} 天 / 日均摄入占比</p>
 {lastMonthData?.totals && lastMonthData.days_with_data > 0 ? (
 <div className="mt-4 space-y-3">
 <NutrientRow label="能量" value={Math.round(lastMonthData.totals.total_kcal / lastMonthData.days_with_data)} refKey="kcal" unit="kcal" color="bg-[#1f5e4b] dark:bg-[#166534]" />
 <NutrientRow label="蛋白质" value={Math.round(lastMonthData.totals.total_protein_g / lastMonthData.days_with_data)} refKey="protein_g" unit="g" color="bg-[#2563eb]" />
 <NutrientRow label="脂肪" value={Math.round(lastMonthData.totals.total_fat_g / lastMonthData.days_with_data)} refKey="fat_g" unit="g" color="bg-[#d97706]" />
 <NutrientRow label="碳水" value={Math.round(lastMonthData.totals.total_carb_g / lastMonthData.days_with_data)} refKey="carb_g" unit="g" color="bg-[#7c3aed]" />
 <NutrientRow label="膳食纤维" value={Math.round(lastMonthData.totals.total_fiber_g / lastMonthData.days_with_data)} refKey="fiber_g" unit="g" color="bg-[#059669]" />
 <NutrientRow label="钠" value={Math.round(lastMonthData.totals.total_sodium_mg / lastMonthData.days_with_data)} refKey="sodium_mg" unit="mg" color="bg-[#dc2626]" />
 <NutrientRow label="糖" value={Math.round(lastMonthData.totals.total_sugar_g / lastMonthData.days_with_data)} refKey="sugar_g" unit="g" color="bg-[#ea580c]" />
 <NutrientRow label="钙" value={Math.round(lastMonthData.totals.total_calcium_mg / lastMonthData.days_with_data)} refKey="calcium_mg" unit="mg" color="bg-[#0891b2]" />
 <NutrientRow label="铁" value={Math.round(lastMonthData.totals.total_iron_mg / lastMonthData.days_with_data)} refKey="iron_mg" unit="mg" color="bg-[#be185d]" />
 <NutrientRow label="维生素C" value={Math.round(lastMonthData.totals.total_vitamin_c_mg / lastMonthData.days_with_data)} refKey="vitamin_c_mg" unit="mg" color="bg-[#65a30d]" />
 <NutrientRow label="维生素A" value={Math.round(lastMonthData.totals.total_vitamin_a_mcg / lastMonthData.days_with_data)} refKey="vitamin_a_mcg" unit="μg" color="bg-[#c026d3]" />
 </div>
 ) : (
 <div className="mt-4 text-sm text-[#5a615c] dark:text-[#9ca3af]">暂无数据</div>
 )}
 {lastMonthData?.issues && lastMonthData.issues.length > 0 ? (
 <div className="mt-5 space-y-2">
 {lastMonthData.issues.map((issue, i) => (
 <div key={i} className="rounded-2xl bg-[#fff7ed] dark:bg-[#2a2216] p-3 text-xs text-[#9a3412] dark:text-[#fb923c]">⚠️ {issue}</div>
 ))}
 </div>
 ) : lastMonthData?.days_with_data ? (
 <div className="mt-5 rounded-2xl bg-[#f0fdf4] dark:bg-[#122117] p-3 text-xs text-[#166534] dark:text-[#86efac]">✅ 上月饮食状态良好</div>
 ) : null}
 </div>
 </section>

 {/* History Calendar */}
 <section className="rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-lg font-semibold tracking-tight">{monthBase.getFullYear()}年{monthBase.getMonth() + 1}月 饮食日历</h3>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">点击日期查看详细记录</p>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => handleMonthNav(-1)}
 className="rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:bg-white dark:hover:bg-[#1a2120] dark:hover:bg-[#243029] transition"
 >
 ← 上月
 </button>
 <button
 type="button"
 onClick={() => handleMonthNav(1)}
 className="rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:bg-white dark:hover:bg-[#1a2120] dark:hover:bg-[#243029] transition"
 >
 下月 →
 </button>
 </div>
 </div>

 {/* Calendar grid */}
 <div className="mt-5 grid grid-cols-7 gap-1">
 {weekDates.map(({ dateStr, label, dayOfWeek }) => {
 const today = new Date(); const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; const isToday = dateStr === todayStr;
 const isSelected = dateStr === selectedDay;
 return (
 <button
 key={dateStr}
 type="button"
 onClick={() => handleDayClick(dateStr)}
 className={`relative flex flex-col items-center rounded-2xl border py-3 text-sm transition ${
 isSelected
 ?"border-[#1f5e4b] dark:border-[#4ade80] bg-[#1f5e4b] dark:bg-[#166534] dark:bg-[#4ade80] text-white dark:text-[#0f1412]"
 : isToday
 ?"border-[#1f5e4b] dark:border-[#4ade80] bg-[#f0f6f4] dark:bg-[#1e2b27] text-[#1f5e4b] dark:text-[#4ade80]"
 :"border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52]"
 }`}
 >
 <span className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-[#5a615c] dark:text-[#9ca3af] '}`}>{weekDays[dayOfWeek]}</span>
 <span className="mt-0.5 text-sm font-medium">{label}</span>
 {monthMealMap[dateStr] ? (
 <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#1f5e4b] dark:bg-[#166534]'}`} />
 ) : null}
 </button>
 );
 })}
 </div>

 {/* Selected day detail */}
 {selectedDay && (
 <div className="mt-6 rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b] p-5">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h4 className="text-base font-semibold tracking-tight">{formatDate(selectedDay)}</h4>

 </div>
 <button
 type="button"
 onClick={() => { setSelectedDay(null); setDayMeals(null); }}
 className="rounded-lg border border-[#e4e5e1] dark:border-[#2d3b36] px-2.5 py-1 text-xs text-[#5a615c] dark:text-[#9ca3af] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] transition"
 >
 收起
 </button>
 </div>

 {dayLoading ? (
 <div className="py-8 text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">加载中...</div>
 ) : dayMeals && dayMeals.meals.length > 0 ? (
 <div className="space-y-3">
 {dayMeals.meals.map((meal) => (
 <MealCard
 key={meal.id}
 title={mealTypeLabel[meal.meal_type] ?? meal.meal_type}
 time={new Date(meal.created_at).toLocaleTimeString()}
 photoUrl={meal.photo_url}
 photoUrls={meal.photo_urls ?? undefined}
 items={(meal.meal_items ?? []).map((item) => ({
 name: item.name,
 kcal: Number(item.kcal ?? 0),
 protein_g: Number(item.protein_g ?? 0),
 fat_g: Number(item.fat_g ?? 0),
 carb_g: Number(item.carb_g ?? 0),
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
 }))}
 personCount={meal.person_count}
 mealAdvice={meal.meal_advice}
 dietaryStructureAdvice={meal.dietary_structure_advice}
 onDelete={() => handleDelete(meal.id)}
 deleting={deletingId === meal.id}
 />
 ))}
 </div>
 ) : (
 <p className="py-8 text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">该日无饮食记录</p>
 )}
 </div>
 )}
 </section>
 </main>
 </div>
 );
}

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
 return (
 <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
 <div className="max-w-md space-y-4 text-center">
 <div className="text-4xl">😵</div>
 <p className="text-lg font-semibold">页面加载出错</p>
 <p className="mt-2 text-sm text-[#5a615c] dark:text-[#9ca3af]">{error.message ||"发生了未知错误"}</p>
 <div className="flex items-center justify-center gap-3 pt-2">
 <button
 type="button"
 onClick={reset}
 className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-5 py-2 text-sm font-medium text-white hover:bg-[#17493b] dark:hover:bg-[#14532d] transition"
 >
 重试
 </button>
 <button
 type="button"
 onClick={() => window.location.reload()}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-5 py-2 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#f0eeea] transition"
 >
 刷新页面
 </button>
 </div>
 </div>
 </div>
 );
}

class DashboardErrorBoundary extends React.Component<
 { children: React.ReactNode },
 { hasError: boolean; error: Error | null }
> {
 constructor(props: { children: React.ReactNode }) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error) {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
 console.error("[DashboardErrorBoundary]", error, errorInfo);
 }

 render() {
 if (this.state.hasError) {
 return (
 <ErrorFallback
 error={this.state.error ?? new Error("未知错误")}
 reset={() => this.setState({ hasError: false, error: null })}
 />
 );
 }
 return this.props.children;
 }
}

export default function RootPage() {
 const { session, loading } = useSupabaseSession();

 if (loading) {
 return (
 <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] dark:bg-[#0f1412] text-sm text-[#5a615c] dark:text-[#9ca3af]">
 加载中...
 </div>
 );
 }

 return (
 <DashboardErrorBoundary>
 {session ? <DashboardPage /> : <LandingPage />}
 </DashboardErrorBoundary>
 );
}
