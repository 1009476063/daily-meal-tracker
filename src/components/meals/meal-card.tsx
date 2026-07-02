"use client";

type Item = {
 name: string;
 kcal: number;
 protein_g: number;
 fat_g: number;
 carb_g: number;
 fiber_g?: number;
 saturated_fat_g?: number;
 sodium_mg?: number;
 calcium_mg?: number;
 iron_mg?: number;
 vitamin_c_mg?: number;
 vitamin_a_mcg?: number;
 sugar_g?: number;
 cholesterol_mg?: number;
 portion_grams?: number;
 food_group?: string;
 dietary_advice?: string;
};

function Badge({ children }: { children: React.ReactNode }) {
 return (
 <span className="inline-flex items-center rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#f0f6f4] dark:bg-[#1e2b27] px-2 py-0.5 text-[11px] font-medium text-[#1f5e4b] dark:text-[#4ade80]">
 {children}
 </span>
 );
}

export function MealCard({
 title,
 time,
 photoUrl,
 photoUrls,
 items,
 personCount,
 mealAdvice,
 dietaryStructureAdvice,
 onDelete,
 deleting,
}: {
 title: string;
 time?: string;
 photoUrl?: string | null;
 photoUrls?: string[];
 items: Item[];
 personCount?: number;
 mealAdvice?: string | null;
 dietaryStructureAdvice?: string | null;
 onDelete?: () => void;
 deleting?: boolean;
}) {
 const total = items.reduce(
 (acc, cur) => ({
 kcal: acc.kcal + cur.kcal,
 protein_g: acc.protein_g + cur.protein_g,
 fat_g: acc.fat_g + cur.fat_g,
 carb_g: acc.carb_g + cur.carb_g,
 fiber_g: acc.fiber_g + (cur.fiber_g ?? 0),
 sodium_mg: acc.sodium_mg + (cur.sodium_mg ?? 0),
 sugar_g: acc.sugar_g + (cur.sugar_g ?? 0),
 saturated_fat_g: acc.saturated_fat_g + (cur.saturated_fat_g ?? 0),
 calcium_mg: acc.calcium_mg + (cur.calcium_mg ?? 0),
 iron_mg: acc.iron_mg + (cur.iron_mg ?? 0),
 vitamin_c_mg: acc.vitamin_c_mg + (cur.vitamin_c_mg ?? 0),
 vitamin_a_mcg: acc.vitamin_a_mcg + (cur.vitamin_a_mcg ?? 0),
 cholesterol_mg: acc.cholesterol_mg + (cur.cholesterol_mg ?? 0),
 }),
 { kcal: 0, protein_g: 0, fat_g: 0, carb_g: 0, fiber_g: 0, sodium_mg: 0, sugar_g: 0, saturated_fat_g: 0, calcium_mg: 0, iron_mg: 0, vitamin_c_mg: 0, vitamin_a_mcg: 0, cholesterol_mg: 0 }
 );

 return (
 <div className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <div className="mb-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <h3 className="text-base font-semibold tracking-tight text-[#141613] dark:text-[#e8e6e0]">{title}</h3>
 <Badge>{Math.round(total.kcal)} kcal</Badge>
 </div>
 <div className="flex items-center gap-3">
 {time ? <span className="text-xs text-[#5a615c] dark:text-[#9ca3af]">{time}</span> : null}
 {onDelete ? (
 <button
 type="button"
 onClick={onDelete}
 disabled={deleting}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-2.5 py-1 text-xs text-[#5a615c] dark:text-[#9ca3af] transition hover:border-[#b91c1c] dark:hover:border-[#f87171] dark:hover:border-[#f87171] hover:text-[#b91c1c] dark:hover:text-[#f87171] disabled:opacity-60"
 >
 {deleting ?"删除中" :"删除"}
 </button>
 ) : null}
 </div>
 </div>

 {(photoUrls && photoUrls.length > 0) || photoUrl ? (() => {
 const images = (photoUrls && photoUrls.length > 0) ? photoUrls : (photoUrl ? [photoUrl] : []);
 const carouselId = `carousel-${title}-${images[0]?.slice(-8)}`;
 return images.length > 0 ? (
 <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b]">
 <div className="flex gap-2 overflow-x-auto scroll-smooth p-2 snap-x snap-mandatory" id={carouselId}>
 {images.map((src, i) => (
 <div key={i} className="flex-shrink-0 snap-center" style={{ minWidth: images.length > 1 ? '80%' : '100%' }}>
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={src} alt={`${title} photo ${i + 1}`} className="mx-auto max-h-56 w-full rounded-xl object-contain bg-[#faf9f5] dark:bg-[#0f1412]" />
 </div>
 ))}
 </div>
 {images.length > 1 && (
 <>
 <button type="button" onClick={() => document.getElementById(carouselId)?.scrollBy({ left: -280, behavior: 'smooth' })} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-[#1a2120]/85 dark:bg-[#1a2120]/80 p-1.5 text-sm shadow hover:bg-white dark:hover:bg-[#1a2120] dark:hover:bg-[#243029]">←</button>
 <button type="button" onClick={() => document.getElementById(carouselId)?.scrollBy({ left: 280, behavior: 'smooth' })} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-[#1a2120]/85 dark:bg-[#1a2120]/80 p-1.5 text-sm shadow hover:bg-white dark:hover:bg-[#1a2120] dark:hover:bg-[#243029]">→</button>
 </>
 )}
 </div>
 ) : null;
 })() : null}

 <div className="space-y-3">
 {items.map((item, idx) => (
 <div key={idx} className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b] p-4">
 <div className="flex items-center justify-between">
 <span className="font-medium text-[#141613] dark:text-[#e8e6e0]">{item.name}</span>
 <span className="text-sm text-[#5a615c] dark:text-[#9ca3af]">{Math.round(item.kcal)} kcal</span>
 </div>
 <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#5a615c] dark:text-[#9ca3af] sm:grid-cols-3">
 <span>蛋白 {Math.round(item.protein_g)}g</span>
 <span>脂肪 {Math.round(item.fat_g)}g</span>
 <span>碳水 {Math.round(item.carb_g)}g</span>
 {item.fiber_g != null ? <span>膳食纤维 {Math.round(item.fiber_g)}g</span> : null}
 {item.sodium_mg != null ? <span>钠 {Math.round(item.sodium_mg)}mg</span> : null}
 {item.sugar_g != null ? <span>糖 {Math.round(item.sugar_g)}g</span> : null}
 {item.saturated_fat_g != null ? <span>饱和脂肪 {Math.round(item.saturated_fat_g)}g</span> : null}
 {item.calcium_mg != null ? <span>钙 {Math.round(item.calcium_mg)}mg</span> : null}
 {item.iron_mg != null ? <span>铁 {Math.round(item.iron_mg)}mg</span> : null}
 {item.vitamin_c_mg != null ? <span>维C {Math.round(item.vitamin_c_mg)}mg</span> : null}
 {item.vitamin_a_mcg != null ? <span>维A {Math.round(item.vitamin_a_mcg)}μg</span> : null}
 {item.cholesterol_mg != null ? <span>胆固醇 {Math.round(item.cholesterol_mg)}mg</span> : null}
 {item.portion_grams ? <span>份量 {Math.round(item.portion_grams)}g</span> : null}
 {item.food_group ? <span>分类 {item.food_group}</span> : null}
 </div>
 {item.dietary_advice ? (
 <div className="mt-2 text-xs text-[#1f5e4b] dark:text-[#4ade80]">💡 {item.dietary_advice}</div>
 ) : null}
 </div>
 ))}
 </div>

 <div className="mt-4 space-y-3 text-sm text-[#3a4641] dark:text-[#c4c1b8]">
 <div className="rounded-2xl bg-[#f0f6f4] dark:bg-[#1e2b27] p-4">
 <div className="font-semibold">合计：</div>
 <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#4a493f] dark:text-[#b8b5ab] sm:grid-cols-3">
 <span>能量 {Math.round(total.kcal)} kcal</span>
 <span>蛋白 {Math.round(total.protein_g)}g</span>
 <span>脂肪 {Math.round(total.fat_g)}g</span>
 <span>碳水 {Math.round(total.carb_g)}g</span>
 <span>膳食纤维 {Math.round(total.fiber_g)}g</span>
 <span>钠 {Math.round(total.sodium_mg)}mg</span>
 <span>糖 {Math.round(total.sugar_g)}g</span>
 <span>饱和脂肪 {Math.round(total.saturated_fat_g)}g</span>
 <span>钙 {Math.round(total.calcium_mg)}mg</span>
 <span>铁 {Math.round(total.iron_mg)}mg</span>
 <span>维C {Math.round(total.vitamin_c_mg)}mg</span>
 <span>维A {Math.round(total.vitamin_a_mcg)}μg</span>
 <span>胆固醇 {Math.round(total.cholesterol_mg)}mg</span>
 </div>
 {personCount && personCount > 1 ? (
 <div className="mt-1 text-xs text-[#4a493f] dark:text-[#b8b5ab]">👥 本餐为 {personCount} 人份</div>
 ) : null}
 </div>
 {mealAdvice ? (
 <div className="rounded-2xl bg-[#f8fbfa] dark:bg-[#151e1b] p-4 text-xs leading-5 text-[#3a4641] dark:text-[#c4c1b8]">
 <span className="font-semibold">搭配建议：</span>{mealAdvice}
 </div>
 ) : null}
 {dietaryStructureAdvice ? (
 <div className="rounded-2xl bg-[#f8fbfa] dark:bg-[#151e1b] p-4 text-xs leading-5 text-[#3a4641] dark:text-[#c4c1b8]">
 <span className="font-semibold">饮食结构建议：</span>{dietaryStructureAdvice}
 </div>
 ) : null}
 </div>
 </div>
 );
}
