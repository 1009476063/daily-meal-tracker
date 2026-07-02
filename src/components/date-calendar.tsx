"use client";

import { useState, useMemo } from "react";

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DateCalendar({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const monthBase = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const cells = useMemo(() => {
    const year = monthBase.getFullYear();
    const month = monthBase.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const result: { dateStr: string; label: string; dayOfWeek: number; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < rows; i++) {
      const dayNum = i - firstDay + 1;
      const d = new Date(year, month, dayNum);
      result.push({
        dateStr: localDateStr(d),
        label: String(d.getDate()),
        dayOfWeek: i % 7,
        isCurrentMonth: d.getMonth() === month,
      });
    }
    return result;
  }, [monthBase]);

  const todayStr = localDateStr(new Date());

  return (
    <div className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#151e1b] p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMonthOffset((p) => p - 1)}
          className="rounded-lg border border-[#e4e5e1] dark:border-[#2d3b36] px-2.5 py-1 text-xs text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#e8e6e0] transition"
        >
          ← 上月
        </button>
        <span className="text-sm font-semibold text-[#141613] dark:text-[#e8e6e0]">
          {monthBase.getFullYear()}年{monthBase.getMonth() + 1}月
        </span>
        <button
          type="button"
          onClick={() => setMonthOffset((p) => p + 1)}
          className="rounded-lg border border-[#e4e5e1] dark:border-[#2d3b36] px-2.5 py-1 text-xs text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#e8e6e0] transition"
        >
          下月 →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-[#b9b5a5] dark:text-[#6b7280] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ dateStr, label, isCurrentMonth }) => {
          const isSelected = dateStr === selected;
          const isToday = dateStr === todayStr;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`relative flex flex-col items-center rounded-xl py-2 text-sm transition ${
                !isCurrentMonth ? "opacity-30" :
                isSelected ? "bg-[#1f5e4b] dark:bg-[#4ade80] text-white dark:text-[#0f1412]" :
                isToday ? "border border-[#1f5e4b] dark:border-[#4ade80] bg-[#f0f6f4] dark:bg-[#1e2b27] text-[#1f5e4b] dark:text-[#4ade80]" :
                "hover:bg-[#f0f6f4] dark:hover:bg-[#1e2b27] text-[#5a615c] dark:text-[#9ca3af]"
              }`}
            >
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
