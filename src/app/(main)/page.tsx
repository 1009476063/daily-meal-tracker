"use client";

import { useEffect, useState } from "react";
import { useSupabaseSession } from "@/lib/supabase-browser";
import { MealCard } from "@/components/meals/meal-card";

type SummaryMeal = {
  id: string;
  meal_type: string;
  created_at: string;
  meal_items: {
    name: string;
    kcal: number | null;
    protein_g: number | null;
    fat_g: number | null;
    carb_g: number | null;
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
  };
};

const mealTypeLabel: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

export default function HomePage() {
  const { session } = useSupabaseSession();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/summary/daily?user_id=${session.user.id}&date=${today}`)
      .then((res) => res.json())
      .then((json: SummaryResponse) => setSummary(json))
      .catch(() => {});
  }, [session?.user]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#e6e2d8] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#8a887e]">今日概览</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">
              {summary ? `${Math.round(summary.summary.total_kcal)} kcal` : "-- kcal"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#6b6a60]">
              {summary
                ? `蛋白 ${Math.round(summary.summary.total_protein_g)}g / 脂肪 ${Math.round(summary.summary.total_fat_g)}g / 碳水 ${Math.round(summary.summary.total_carb_g)}g`
                : "先完成第一份饮食记录，系统会自动汇总热量与三大营养素。"}
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-[#d8d5c9] bg-[#faf9f5] px-5 py-4 text-sm text-[#6b6a60]">
            {summary ? "数据来自今日记录" : "记录后这里会实时更新"}
          </div>
        </div>
      </section>

      {(summary?.meals ?? []).map((meal) => (
        <MealCard
          key={meal.id}
          title={mealTypeLabel[meal.meal_type] ?? meal.meal_type}
          time={new Date(meal.created_at).toLocaleTimeString()}
          items={(meal.meal_items ?? []).map((item) => ({
            name: item.name,
            kcal: Number(item.kcal ?? 0),
            protein_g: Number(item.protein_g ?? 0),
            fat_g: Number(item.fat_g ?? 0),
            carb_g: Number(item.carb_g ?? 0),
          }))}
        />
      ))}
    </div>
  );
}
