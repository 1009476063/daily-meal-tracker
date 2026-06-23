"use client";

import { useRef, useState } from "react";

export default function UploadMealPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "recognizing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setStatus("recognizing");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("meal_type", "lunch");
    formData.append("date", new Date().toISOString().slice(0, 10));

    try {
      const res = await fetch("/api/ai/recognize", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(String(json.error ?? "识别失败"));
      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "识别失败");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">上传饮食照片</h1>
        <p className="mt-2 text-sm text-[#6b6a60]">
          选择或拍摄一张食物照片，系统会自动识别并生成结构化记录。
        </p>
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
                {status === "recognizing" && "AI 正在识别中..."}
                {status === "done" && "识别完成，后续将展示结构化结果。"}
                {status === "error" && (
                  <span className="text-[#9b4d3a]">{error}</span>
                )}
              </div>
              <p className="text-xs text-[#8a887e]">
                接入模型配置后，这里会直接展示：食物名称、克数、卡路里、蛋白质、脂肪、碳水。
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
