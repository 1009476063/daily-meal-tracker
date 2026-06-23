import { MealCard } from "@/components/meals/meal-card";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#e6e2d8] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#8a887e]">今日概览</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">0 kcal</h2>
            <p className="mt-2 max-w-md text-sm text-[#6b6a60]">
              先完成第一份饮食记录，系统会自动汇总热量与三大营养素。
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-[#d8d5c9] bg-[#faf9f5] px-5 py-4 text-sm text-[#6b6a60]">
            接入 Supabase 后，这里会展示实时统计。
          </div>
        </div>
      </section>
      <MealCard
        title="午餐"
        time="刚刚添加"
        items={[
          { name: "番茄炒蛋", kcal: 280, protein_g: 14, fat_g: 17, carb_g: 18 },
          { name: "米饭", kcal: 230, protein_g: 5, fat_g: 1, carb_g: 50 },
        ]}
      />
    </div>
  );
}
