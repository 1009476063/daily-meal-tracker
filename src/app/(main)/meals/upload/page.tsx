"use client";

import { useRef, useState, useMemo } from"react";
import { useSupabaseSession, createSupabaseBrowserClient } from"@/lib/supabase-browser";
import { useRouter } from"next/navigation";
import { DateCalendar } from "@/components/date-calendar";

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}


/* ── types ── */
type RecognizedItem = {
  name: string;
  ingredients: string[];
  portion_grams: number | null;
  kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carb_g: number | null;
  fiber_g: number | null;
  saturated_fat_g: number | null;
  sodium_mg: number | null;
  calcium_mg: number | null;
  iron_mg: number | null;
  vitamin_c_mg: number | null;
  vitamin_a_mcg: number | null;
  sugar_g: number | null;
  cholesterol_mg: number | null;
  food_group: string | null;
  dietary_advice: string | null;
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
 suggestions?: string[];
 person_count?: number;
 meal_advice?: string;
 dietary_structure_advice?: string;
};

type ManualItem = {
 name: string;
 kcal: string;
 protein_g: string;
 fat_g: string;
 carb_g: string;
 fiber_g: string;
 portion_grams: string;
 saturated_fat_g: string;
 sodium_mg: string;
 calcium_mg: string;
 iron_mg: string;
 vitamin_c_mg: string;
 vitamin_a_mcg: string;
 sugar_g: string;
 cholesterol_mg: string;
 food_group: string;
};

const emptyManualItem: ManualItem = {
 name:"", kcal:"", protein_g:"", fat_g:"", carb_g:"", fiber_g:"", portion_grams:"",
 saturated_fat_g:"", sodium_mg:"", calcium_mg:"", iron_mg:"", vitamin_c_mg:"", vitamin_a_mcg:"",
 sugar_g:"", cholesterol_mg:"", food_group:"",
};





/* ── main page ── */
export default function UploadMealPage() {
 const inputRef = useRef<HTMLInputElement>(null);
 const { session } = useSupabaseSession();
 const router = useRouter();

 const [selectedDate, setSelectedDate] = useState(localDateStr(new Date()));
 const [showCalendar, setShowCalendar] = useState(false);
 const [previews, setPreviews] = useState<string[]>([]);
 const [r2Urls, setR2Urls] = useState<{ url: string; key: string }[]>([]);
 const [status, setStatus] = useState<"idle" |"uploading" |"recognizing" |"saving" |"done" |"error">("idle");
 const [error, setError] = useState<string | null>(null);
 const [result, setResult] = useState<RecognizeResult | null>(null);
 const [mealType, setMealType] = useState<"breakfast" |"lunch" |"dinner" |"snack">("lunch");
 const [resetKey, setResetKey] = useState(0);
 const [mode, setMode] = useState<"photo" |"manual">("photo");
 const [personCount, setPersonCount] = useState<number>(1);

 const [manualItems, setManualItems] = useState<ManualItem[]>([{ ...emptyManualItem }]);
 const [manualSaving, setManualSaving] = useState(false);
 const [manualError, setManualError] = useState<string | null>(null);

 const resetState = () => {
 setResult(null);
 setError(null);
 setStatus("idle");
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files || files.length === 0 || !session?.user) return;

 resetState();
 setStatus("uploading");

 try {
 const { data: authSession } = await createSupabaseBrowserClient().auth.getSession();
 const authToken = authSession.session?.access_token;
 const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
 const uploaded: { url: string; key: string }[] = [];
 const newPreviews: string[] = [];
 for (let i = 0; i < files.length; i++) {
 const file = files[i];
 newPreviews.push(URL.createObjectURL(file));
 const uploadForm = new FormData();
 uploadForm.append("file", file);
 uploadForm.append("user_id", session.user.id);
 uploadForm.append("user_email", session.user.email ??"");
 const uploadRes = await fetch("/api/upload", { method:"POST", headers: authHeaders, body: uploadForm });
 const uploadJson = await uploadRes.json();
 if (!uploadRes.ok) throw new Error(String(uploadJson.error ??"上传失败"));
 uploaded.push({ url: uploadJson.url, key: uploadJson.key });
 }
 setPreviews(newPreviews);
 setR2Urls(uploaded);

 setStatus("recognizing");
 const recognizeCtrl = new AbortController();
 const recognizeTimeout = setTimeout(() => recognizeCtrl.abort(), 120_000);
 let recognizeRes: Response;
 try {
 recognizeRes = await fetch("/api/ai/recognize", {
 method:"POST",
 headers: {"Content-Type":"application/json", ...authHeaders },
 body: JSON.stringify({ image_urls: uploaded.map((u) => u.url), image_url: uploaded[0]?.url, person_count: personCount, user_id: session.user.id }),
 signal: recognizeCtrl.signal,
 });
 } catch (fetchErr) {
 clearTimeout(recognizeTimeout);
 if (fetchErr instanceof DOMException && fetchErr.name ==="AbortError") {
 throw new Error("AI 识别超时，请减少图片数量或稍后重试");
 }
 throw fetchErr;
 }
 clearTimeout(recognizeTimeout);
 const recognizeJson = await recognizeRes.json();
 if (!recognizeRes.ok) throw new Error(String(recognizeJson.error ??"识别失败"));
 setResult(recognizeJson as RecognizeResult);

 setStatus("done");
 } catch (err) {
 setError(err instanceof Error ? err.message : String(err));
 setStatus("error");
 }
 };

 /* ── manual save ── */
 const updateManualItem = (idx: number, key: keyof ManualItem, value: string) => {
 setManualItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
 };

 const handleManualSave = async () => {
 if (!session?.user) return;
 setManualError(null);

 const validItems = manualItems.filter((item) => item.name.trim() !=="");
 if (validItems.length === 0) {
 setManualError("请至少填写一项食物名称");
 return;
 }

 setManualSaving(true);
 try {
 const { data: manualAuthSession } = await createSupabaseBrowserClient().auth.getSession();
 const manualAuthToken = manualAuthSession.session?.access_token;
 const manualAuthHeaders: Record<string, string> = manualAuthToken ? { Authorization: `Bearer ${manualAuthToken}` } : {};
 const items = validItems.map((item) => ({
 name: item.name.trim(),
 ingredients: [],
 portion_grams: item.portion_grams ? Number(item.portion_grams) : null,
 kcal: item.kcal ? Number(item.kcal) : null,
 protein_g: item.protein_g ? Number(item.protein_g) : null,
 fat_g: item.fat_g ? Number(item.fat_g) : null,
 carb_g: item.carb_g ? Number(item.carb_g) : null,
 fiber_g: item.fiber_g ? Number(item.fiber_g) : null,
 saturated_fat_g: item.saturated_fat_g ? Number(item.saturated_fat_g) : null,
 sodium_mg: item.sodium_mg ? Number(item.sodium_mg) : null,
 calcium_mg: item.calcium_mg ? Number(item.calcium_mg) : null,
 iron_mg: item.iron_mg ? Number(item.iron_mg) : null,
 vitamin_c_mg: item.vitamin_c_mg ? Number(item.vitamin_c_mg) : null,
 vitamin_a_mcg: item.vitamin_a_mcg ? Number(item.vitamin_a_mcg) : null,
 sugar_g: item.sugar_g ? Number(item.sugar_g) : null,
 cholesterol_mg: item.cholesterol_mg ? Number(item.cholesterol_mg) : null,
 food_group: item.food_group.trim() || null,
 dietary_advice: null,
 confidence: null,
 }));

 const res = await fetch("/api/meals", {
 method:"POST",
 headers: {"Content-Type":"application/json", ...manualAuthHeaders },
 body: JSON.stringify({
 user_id: session.user.id,
 date: selectedDate,
 meal_type: mealType,
 source:"manual",
 person_count: personCount,
 items,
 }),
 });
 const json = await res.json();
 if (!res.ok) throw new Error(String(json.error ??"保存失败"));

 setStatus("done");
 setManualItems([{ ...emptyManualItem }]);
 } catch (err) {
 setManualError(err instanceof Error ? err.message : String(err));
 } finally {
 setManualSaving(false);
 }
 };

 /* ── render ── */
 return (
 <div className="space-y-6">
 {/* header */}
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-semibold tracking-tight">记录饮食</h1>
 <button
 type="button"
 onClick={() => router.push("/")}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] transition"
 >
 ← 返回首页
 </button>
 </div>

 {/* date selector */}
 <div className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-4 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <span className="text-sm text-[#5a615c] dark:text-[#9ca3af]">📅 记录日期</span>
 <button
 type="button"
 onClick={() => setShowCalendar((p) => !p)}
 className="rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b] px-4 py-2 text-sm font-medium text-[#141613] dark:text-[#e8e6e0] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] transition"
 >
 {formatDate(selectedDate)}
 </button>
 {selectedDate !== localDateStr(new Date()) && (
 <button
 type="button"
 onClick={() => setSelectedDate(localDateStr(new Date()))}
 className="rounded-lg border border-[#1f5e4b] dark:border-[#4ade80] px-2.5 py-1 text-xs text-[#1f5e4b] dark:text-[#4ade80] hover:bg-[#f0f6f4] dark:hover:bg-[#1e2b27] dark:hover:bg-[#1e2b27] transition"
 >
 回到今日
 </button>
 )}
 </div>
 </div>

 {showCalendar && (
 <div className="mt-3">
 <DateCalendar
 selected={selectedDate}
 onSelect={(d) => { setSelectedDate(d); setShowCalendar(false); }}
 />
 </div>
 )}
 </div>

 {/* mode + meal type + person count */}
 <div className="flex flex-wrap items-center gap-3">
 <div className="flex rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] overflow-hidden">
 {(["photo","manual"] as const).map((m) => (
 <button
 key={m}
 type="button"
 onClick={() => { setMode(m); resetState(); setResetKey((k) => k + 1); setManualItems([{ ...emptyManualItem }]);
 }}
 className={`px-4 py-2 text-sm font-medium transition ${mode === m ?"bg-[#1f5e4b] dark:bg-[#166534] text-white" :"text-[#5a615c] dark:text-[#9ca3af] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0]"}`}
 >
 {m ==="photo" ?"📷 拍照识别" :"✏️ 手动录入"}
 </button>
 ))}
 </div>

 <select
 value={mealType}
 onChange={(e) => setMealType(e.target.value as"breakfast" |"lunch" |"dinner" |"snack")}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2 text-sm text-[#141613] dark:text-[#e8e6e0] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none"
 >
 <option value="breakfast">早餐</option>
 <option value="lunch">午餐</option>
 <option value="dinner">晚餐</option>
 <option value="snack">加餐</option>
 </select>

 <div className="flex items-center gap-2">
 <span className="text-sm text-[#5a615c] dark:text-[#9ca3af]">👥 人数</span>
 <select
 value={personCount}
 onChange={(e) => setPersonCount(Number(e.target.value))}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-3 py-2 text-sm text-[#141613] dark:text-[#e8e6e0] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none"
 >
 {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
 <option key={n} value={n}>{n} 人</option>
 ))}
 </select>
 </div>
 </div>

 {mode ==="photo" ? (
 <div className="space-y-4">
 <div className="rounded-3xl border-2 border-dashed border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-8 text-center transition hover:border-[#b9b5a5] dark:hover:border-[#4a5a52]">
 <input
 key={resetKey}
 ref={inputRef}
 type="file"
 accept="image/*"
 multiple
 className="hidden"
 onChange={handleFileChange}
 />
 {previews.length > 0 ? (
 <div className="space-y-4">
 <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
 {previews.map((src, i) => (
 // eslint-disable-next-line @next/next/no-img-element
 <img key={i} src={src} alt={`preview ${i + 1}`} className="h-40 flex-shrink-0 rounded-xl object-contain snap-center" />
 ))}
 </div>
 <button
 type="button"
 onClick={() => { resetState(); setPreviews([]); setR2Urls([]); setResetKey((k) => k + 1); }}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-4 py-2 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] transition"
 >
 重新选择
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 <div className="text-4xl">📸</div>
 <p className="text-sm text-[#5a615c] dark:text-[#9ca3af]">点击或拖拽食物照片到此处</p>
 <p className="text-xs text-[#b9b5a5] dark:text-[#6b7280]">支持同时上传多张照片，AI 将综合分析</p>
 <button
 type="button"
 onClick={() => inputRef.current?.click()}
 className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] dark:bg-[#4ade80] px-5 py-2.5 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] dark:hover:bg-[#22c55e] transition"
 >
 选择照片
 </button>
 </div>
 )}
 </div>

 {/* status messages */}
 {status ==="uploading" && <p className="text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">上传中...</p>}
 {status ==="recognizing" && <p className="text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">AI 识别中，多张图片可能需要 30-60 秒，请耐心等待...</p>}
 {status ==="saving" && <p className="text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">保存中...</p>}
 {error && (
 <div className="rounded-2xl bg-red-50 dark:bg-[#2a1215] border border-red-200 dark:border-[#7f1d1d] p-4 text-sm text-red-700 dark:text-[#fca5a5]">{error}</div>
 )}
 {status ==="done" && (
 <div className="rounded-2xl bg-green-50 dark:bg-[#122117] border border-green-200 dark:border-[#14532d] p-4 text-sm text-green-700 dark:text-[#86efac] flex items-center justify-between">
 <span>✅ 已保存到 {formatDate(selectedDate)}</span>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => { resetState(); setPreviews([]); setR2Urls([]); setResetKey((k) => k + 1); }}
 className="rounded-full border border-green-300 px-3 py-1 text-xs text-green-700 dark:text-[#86efac] hover:bg-green-100 dark:hover:bg-[#14532d] transition"
 >
 继续记录
 </button>
 <button
 type="button"
 onClick={() => router.push("/")}
 className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-3 py-1 text-xs text-white hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] transition"
 >
 查看首页
 </button>
 </div>
 </div>
 )}

 {/* recognized result */}
 {result && result.items && result.items.length > 0 ? (
 <div className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] space-y-4">
 {/* edit + save */}
 <div className="flex items-center justify-end">
 <button type="button" onClick={async () => {
 if (!session?.user) return;
 try {
 const { data: authSession } = await createSupabaseBrowserClient().auth.getSession();
 const token = authSession.session?.access_token;
 const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
 const saveRes = await fetch("/api/meals", {
 method: "POST",
 headers: { "Content-Type": "application/json", ...authHeaders },
 body: JSON.stringify({
 user_id: session.user.id,
 date: selectedDate,
 meal_type: mealType,
 photo_urls: r2Urls.map((u) => u.url),
 photo_storage_keys: r2Urls.map((u) => u.key),
 source: "ai",
 person_count: result.person_count ?? personCount,
 meal_advice: result.meal_advice ?? undefined,
 dietary_structure_advice: result.dietary_structure_advice ?? undefined,
 items: result.items.map((it) => ({ ...it, ingredients: it.ingredients ?? [], dietary_advice: it.dietary_advice ?? null, food_group: it.food_group ?? null, confidence: it.confidence ?? null })),
 }),
 });
 const json = await saveRes.json();
 if (!saveRes.ok) throw new Error(String(json.error ?? "保存失败"));
 setStatus("done");
 } catch (err) {
 setError(err instanceof Error ? err.message : String(err));
 }
 }} className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-4 py-2 text-sm text-white dark:text-[#0f1412]">保存识别结果</button>
 </div>
 <div className="flex items-center justify-between">
 <h3 className="text-base font-semibold tracking-tight text-[#141613] dark:text-[#e8e6e0]">识别结果</h3>
 {result.person_count && result.person_count > 1 ? (
 <span className="rounded-full bg-[#f0f6f4] dark:bg-[#1e2b27] px-3 py-1 text-xs font-medium text-[#1f5e4b] dark:text-[#4ade80]">👥 {result.person_count} 人份</span>
 ) : null}
 </div>

 {result.items.map((item, idx) => {
            const patch = (key: keyof RecognizedItem, value: string) => {
              setResult((prev) => {
                if (!prev) return prev;
                const items = prev.items.map((it, i) => i === idx ? { ...it, [key]: value } : it);
                return { ...prev, items };
              });
            };
            return (
              <div key={idx} className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input className="flex-1 rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-3 py-2 text-sm text-[#141613] dark:text-[#e8e6e0]" value={item.name} onChange={(e) => patch("name", e.target.value)} />
                  <input className="w-28 rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-3 py-2 text-sm text-right text-[#141613] dark:text-[#e8e6e0]" value={String(item.kcal ?? "")} onChange={(e) => patch("kcal", e.target.value)} placeholder="kcal" />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {["protein_g","fat_g","carb_g","fiber_g","saturated_fat_g","sodium_mg","calcium_mg","iron_mg","vitamin_c_mg","vitamin_a_mcg","sugar_g","cholesterol_mg","portion_grams"].map((k) => (
                    <label key={k} className="text-xs text-[#5a615c] dark:text-[#9ca3af]">
                      <span className="mb-1 block">{k}</span>
                      <input className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-3 py-2 text-sm text-right text-[#141613] dark:text-[#e8e6e0]" value={String((item as unknown as Record<string, unknown>)[k] ?? "")} onChange={(e) => setResult((prev) => {
                        if (!prev) return prev;
                        const items = prev.items.map((it, i) => i === idx ? { ...it, [k]: e.target.value === "" ? null : Number(e.target.value) } : it);
                        return { ...prev, items };
                      })} />
                    </label>
                  ))}
                </div>
                <input className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-3 py-2 text-sm text-[#141613] dark:text-[#e8e6e0]" value={item.food_group ?? ""} onChange={(e) => patch("food_group", e.target.value)} placeholder="食物分类" />
                <textarea className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-3 py-2 text-sm text-[#141613] dark:text-[#e8e6e0]" rows={2} value={item.dietary_advice ?? ""} onChange={(e) => patch("dietary_advice", e.target.value)} placeholder="该食物搭配建议" />
              </div>
            );
          })}

 {result.meal_advice ? (
 <div className="rounded-2xl bg-[#f0f6f4] dark:bg-[#1e2b27] p-4 text-xs text-[#3a4641] dark:text-[#c4c1b8]">
 <span className="font-semibold">搭配建议：</span>{result.meal_advice}
 </div>
 ) : null}
 {result.dietary_structure_advice ? (
 <div className="rounded-2xl bg-[#f7faf8] dark:bg-[#151e1b] p-4 text-xs text-[#3a4641] dark:text-[#c4c1b8]">
 <span className="font-semibold">饮食结构建议：</span>{result.dietary_structure_advice}
 </div>
 ) : null}
 </div>
 ) : null}
 </div>
 ) : (
 /* ── manual entry ── */
 <div className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] space-y-4">
 {manualItems.map((item, idx) => (
 <div key={idx} className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b] p-4 space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-[#5a615c] dark:text-[#9ca3af]">食物 {idx + 1}</span>
 {manualItems.length > 1 && (
 <button
 type="button"
 onClick={() => setManualItems((prev) => prev.filter((_, i) => i !== idx))}
 className="text-xs text-[#b91c1c] dark:text-[#f87171] hover:underline"
 >
 移除
 </button>
 )}
 </div>

 <input
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2.5 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 placeholder="食物名称（必填）"
 value={item.name}
 onChange={(e) => updateManualItem(idx,"name", e.target.value)}
 />

 <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
 {([
 { key:"portion_grams" as const, label:"份量(g)", placeholder:"如 200" },
 { key:"kcal" as const, label:"能量(kcal)", placeholder:"如 300" },
 { key:"protein_g" as const, label:"蛋白质(g)", placeholder:"如 20" },
 { key:"fat_g" as const, label:"脂肪(g)", placeholder:"如 10" },
 { key:"carb_g" as const, label:"碳水(g)", placeholder:"如 40" },
 { key:"fiber_g" as const, label:"膳食纤维(g)", placeholder:"如 5" },
 { key:"saturated_fat_g" as const, label:"饱和脂肪(g)", placeholder:"如 3" },
 { key:"sodium_mg" as const, label:"钠(mg)", placeholder:"如 500" },
 { key:"calcium_mg" as const, label:"钙(mg)", placeholder:"如 100" },
 { key:"iron_mg" as const, label:"铁(mg)", placeholder:"如 5" },
 { key:"vitamin_c_mg" as const, label:"维C(mg)", placeholder:"如 30" },
 { key:"vitamin_a_mcg" as const, label:"维A(μg)", placeholder:"如 200" },
 { key:"sugar_g" as const, label:"糖(g)", placeholder:"如 8" },
 { key:"cholesterol_mg" as const, label:"胆固醇(mg)", placeholder:"如 50" },
 { key:"food_group" as const, label:"食物分类", placeholder:"如 谷薯类" },
 ]).map(({ key, label, placeholder }) => (
 <div key={key}>
 <label className="mb-1 block text-[11px] text-[#5a615c] dark:text-[#9ca3af]">{label}</label>
 <input
 type={key ==="food_group" ?"text" :"number"}
 step="any"
 className="w-full rounded-lg border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-3 py-2 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#ccc] dark:placeholder:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 placeholder={placeholder}
 value={item[key]}
 onChange={(e) => updateManualItem(idx, key, e.target.value)}
 />
 </div>
 ))}
 </div>
 </div>
 ))}

 <button
 type="button"
 onClick={() => setManualItems((prev) => [...prev, { ...emptyManualItem }])}
 className="w-full rounded-2xl border border-dashed border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412] dark:bg-[#151e1b] py-3 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:border-[#1f5e4b] dark:hover:border-[#4ade80] hover:text-[#1f5e4b] dark:hover:text-[#4ade80] transition"
 >
 + 添加更多食物
 </button>

 {manualError && (
 <div className="rounded-xl bg-red-50 dark:bg-[#2a1215] border border-red-200 dark:border-[#7f1d1d] p-3 text-sm text-red-700 dark:text-[#fca5a5]">{manualError}</div>
 )}

 <button
 type="button"
 disabled={manualSaving}
 onClick={handleManualSave}
 className="w-full rounded-2xl bg-[#1f5e4b] dark:bg-[#166534] px-4 py-3 text-white font-medium hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] transition disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {manualSaving ?"保存中..." : `保存到 ${formatDate(selectedDate)}`}
 </button>
 </div>
 )}
 </div>
 );
}
