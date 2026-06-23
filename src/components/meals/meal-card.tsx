type Item = {
  name: string;
  kcal: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
};

export function MealCard({
  title,
  time,
  items,
}: {
  title: string;
  time?: string;
  items: Item[];
}) {
  const total = items.reduce(
    (acc, cur) => ({
      kcal: acc.kcal + cur.kcal,
      protein_g: acc.protein_g + cur.protein_g,
      fat_g: acc.fat_g + cur.fat_g,
      carb_g: acc.carb_g + cur.carb_g,
    }),
    { kcal: 0, protein_g: 0, fat_g: 0, carb_g: 0 }
  );

  return (
    <div className="rounded-3xl border border-[#e6e2d8] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {time ? <span className="text-xs text-[#8a887e]">{time}</span> : null}
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-[#faf9f5] p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-[#7a796f]">{item.kcal} kcal</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[#6b6a60]">
              <span>蛋白 {item.protein_g}g</span>
              <span>脂肪 {item.fat_g}g</span>
              <span>碳水 {item.carb_g}g</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-[#f3f1ea] p-4 text-sm text-[#4a493f]">
        <span className="font-semibold">合计：</span>
        {Math.round(total.kcal)} kcal / 蛋白 {Math.round(total.protein_g)}g / 脂肪{" "}
        {Math.round(total.fat_g)}g / 碳水 {Math.round(total.carb_g)}g
      </div>
    </div>
  );
}
