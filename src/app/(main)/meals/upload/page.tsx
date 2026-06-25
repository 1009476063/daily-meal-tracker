"use client";

import { useRef, useState } from "react";
import { useSupabaseSession } from "@/lib/supabase-browser";

type RecognizedItem = {
  name: string;
  ingredients: string[];
  portion_grams: number;
  kcal: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
  fiber_g: number;
  confidence: "low" | "medium" | "high";
};

type RecognizeResult = {
  recognized: boolean;
  items: RecognizedItem[];
  summary: {
    total_kcal: number;
    total_protein_g: number;
    total_fat_g: number;
    total_carb_g: number;
  };
};

export default function UploadMealPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = useSupabaseSession();
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "recognizing" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecognizeResult | null>(null);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");

  const resetState = () => {
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;

    resetState();
    setPreview(URL.createObjectURL(file));
    setStatus("uploading");

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(String(uploadJson.error ?? "上传失败"));

      setStatus("recognizing");
      const recognizeForm = new FormData();
      recognizeForm.append("file", file);
      recognizeForm.append("meal_type", mealType);
      recognizeForm.append("date", new Date().toISOString().slice(0, 10));
      const recognizeRes = await fetch("/api/ai/recognize", { method: "POST", body: recognizeForm });
      const recognizeJson = await recognizeRes.json();
      if (!recognizeRes.ok) throw new Error(String(recognizeJson.error ?? "识别失败"));

      setResult(recognizeJson as RecognizeResult);
      setStatus("saving");

      const items = (recognizeJson.items ?? []).map((item: RecognizedItem) => ({
        name: item.name,
        ingredients: item.ingredients ?? [],
        portion_grams: item.portion_grams ?? null,
        kcal: item.kcal ?? null,
        protein_g: item.protein_g ?? null,
        fat_g: item.fat_g ?? null,
        carb_g: item.carb_g ?? null,
        fiber_g: item.fiber_g ?? null,
        confidence: item.confidence ?? null,
      }));

      const saveRes = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          date: new Date().toISOString().slice(0, 10),
          meal_type: mealType,
          photo_url: uploadJson.url,
          photo_storage_key: uploadJson.key,
          source: items.length ? "ai" : "manual",
          items: items.length ? items : [{ name: "未识别食物", kcal: 0, protein_g: 0, fat_g: 0, carb_g: 0 }],
        }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok) throw new Error(String(saveJson.error ?? "保存失败"));

      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "处理失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">上传饮食照片</h1>
          <p className="mt-2 text-sm text-[#6b6a60]">
            选择或拍摄一张食物照片，系统会自动识别并生成结构化记录。
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8a887e]">餐食类型</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as typeof mealType)}
            className="rounded-xl border border-[#e6e2d8] bg-white px-3 py-2 text-sm text-[#2f3029]"
          >
            <option value="breakfast">早餐</option>
            <option value="lunch">午餐</option>
            <option value="dinner">晚餐</option>
            <option value="snack">加餐</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e6e2d8] bg-white p-6 shadow-sm">
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8d5c9] bg-[#faf9f5] px-6 py-12 text-center text-sm text-[#6b6a60] transition hover:border-[#b9b5a5]"
          onClick={() => inputRef.current?.click()}
        >
          <p className="text-base font-medium text-[#2f3029]">点击上传照片</p>
          <p className="mt-1">支持 JPG / PNG / WebP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {preview ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-[#e6e2d8] bg-[#faf9f5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="食物预览" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#f3f1ea] p-4 text-sm text-[#4a493f]">
                {status === "uploading" && "正在上传图片..."}
                {status === "recognizing" && "AI 正在识别中..."}
                {status === "saving" && "正在保存记录..."}
                {status === "done" && "识别完成并已保存记录。"}
                {status === "error" && <span className="text-[#9b4d3a]">{error}</span>}
              </div>

              {result ? (
                <div className="space-y-3">
                  {result.items.map((item, idx) => (
                    <div key={idx} className="rounded-2xl bg-[#faf9f5] p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-[#7a796f]">{item.kcal} kcal</span>
                      </div>
                      <div className="mt-2 text-xs text-[#6b6a60]">
                        蛋白 {item.protein_g}g / 脂肪 {item.fat_g}g / 碳水 {item.carb_g}g
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
