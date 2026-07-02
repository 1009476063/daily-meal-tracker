export type SummaryMeal = {
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

export type SummaryResponse = {
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

export type MonitoringData = {
  totals: Record<string, number>;
  issues: string[];
  days_with_data: number;
} | null;

export const mealTypeLabel: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

export const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

export const DAILY_REFERENCE = {
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

export type NutrientKey = keyof typeof DAILY_REFERENCE;

export function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const over = pct > 100;
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#e4e5e1] dark:bg-[#2d3b36]">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${over ? 'bg-[#b91c1c]' : color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`w-12 text-right text-[11px] ${over ? 'text-[#b91c1c] dark:text-[#f87171] font-semibold' : 'text-[#5a615c] dark:text-[#9ca3af]'}`}>
        {pct}%
      </span>
    </div>
  );
}

export function NutrientRow({ label, value, refKey, unit, color, reference }: { label: string; value: number; refKey: NutrientKey; unit: string; color: string; reference?: number }) {
  const ref = reference ?? DAILY_REFERENCE[refKey];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#5a615c] dark:text-[#9ca3af]">{label}</span>
        <span className="text-[#141613] dark:text-[#e8e6e0]">{Math.round(value)}{unit} <span className="text-[#b9b5a5] dark:text-[#6b7280]">/ {ref}{unit}</span></span>
      </div>
      <ProgressBar value={value} max={ref} color={color} />
    </div>
  );
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
