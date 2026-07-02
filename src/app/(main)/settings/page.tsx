"use client";

import { useEffect, useState } from"react";
import { useSupabaseSession } from"@/lib/supabase-browser";

type Settings = {
 ai_base_url: string;
 ai_api_key: string;
 ai_model: string;
 daily_kcal_target: number;
 daily_protein_target: number;
 daily_fat_target: number;
 daily_carb_target: number;
 daily_fiber_target: number;
};

type SystemAi = {
 ai_base_url: string | null;
 ai_model: string | null;
 ai_api_key_masked: string | null;
};

type TestResult = {
 ok: boolean;
 message?: string;
 error?: string;
 model_used?: string;
 reply?: string;
 usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
};

const DEFAULTS: Settings = {
 ai_base_url:"",
 ai_api_key:"",
 ai_model:"",
 daily_kcal_target: 2000,
 daily_protein_target: 65,
 daily_fat_target: 60,
 daily_carb_target: 300,
 daily_fiber_target: 25,
};

export default function SettingsPage() {
 const { session } = useSupabaseSession();
 const [settings, setSettings] = useState<Settings>(DEFAULTS);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [msg, setMsg] = useState<string | null>(null);
 const [systemAi, setSystemAi] = useState<SystemAi | null>(null);
 const [testResult, setTestResult] = useState<TestResult | null>(null);
 const [testing, setTesting] = useState(false);

 useEffect(() => {
 if (!session?.user) return;
 fetch(`/api/settings?user_id=${session.user.id}`)
 .then((r) => r.json())
 .then((d) => {
 setSettings({
 ai_base_url: d.ai_base_url ??"",
 ai_api_key: d.ai_api_key ??"",
 ai_model: d.ai_model ??"",
 daily_kcal_target: d.daily_kcal_target ?? 2000,
 daily_protein_target: d.daily_protein_target ?? 65,
 daily_fat_target: d.daily_fat_target ?? 60,
 daily_carb_target: d.daily_carb_target ?? 300,
 daily_fiber_target: d.daily_fiber_target ?? 25,
 });
 })
 .catch(() => {})
 .finally(() => setLoading(false));

 fetch("/api/settings/system-ai")
 .then((r) => r.json())
 .then((d: SystemAi) => setSystemAi(d))
 .catch(() => {});
 }, [session?.user]);

 const handleSave = async () => {
 if (!session?.user) return;
 setSaving(true);
 setMsg(null);
 try {
 const res = await fetch("/api/settings", {
 method:"PUT",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ user_id: session.user.id, ...settings }),
 });
 if (!res.ok) throw new Error((await res.json()).error);
 setMsg("设置已保存");
 } catch (e) {
 setMsg(e instanceof Error ? e.message :"保存失败");
 } finally {
 setSaving(false);
 }
 };

 const handleTest = async () => {
 if (!session?.user) return;
 setTesting(true);
 setTestResult(null);
 try {
 const res = await fetch("/api/settings/test-ai", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 user_id: session.user.id,
 ai_base_url: settings.ai_base_url || undefined,
 ai_api_key: settings.ai_api_key || undefined,
 ai_model: settings.ai_model || undefined,
 }),
 });
 const data: TestResult = await res.json();
 setTestResult(data);
 } catch (e) {
 setTestResult({ ok: false, error: e instanceof Error ? e.message :"测试请求失败" });
 } finally {
 setTesting(false);
 }
 };

 if (loading) {
 return <div className="py-12 text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">加载中...</div>;
 }

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
 <p className="mt-2 text-sm text-[#5a615c] dark:text-[#9ca3af]">管理你的 AI 配置和营养目标</p>
 </div>

 {/* System AI Info */}
 <section className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h2 className="text-lg font-semibold tracking-tight">🔧 系统当前 AI 配置</h2>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">未自定义时使用的默认配置</p>
 <div className="mt-4 space-y-2 text-sm">
 <div className="flex items-center gap-3">
 <span className="w-24 text-[#5a615c] dark:text-[#9ca3af]">Base URL</span>
 <span className="rounded-lg bg-[#f0f6f4] dark:bg-[#1e2b27] px-3 py-1.5 font-mono text-xs text-[#141613] dark:text-[#e8e6e0]">{systemAi?.ai_base_url ??"未配置"}</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="w-24 text-[#5a615c] dark:text-[#9ca3af]">模型 ID</span>
 <span className="rounded-lg bg-[#f0f6f4] dark:bg-[#1e2b27] px-3 py-1.5 font-mono text-xs text-[#141613] dark:text-[#e8e6e0]">{systemAi?.ai_model ??"未配置"}</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="w-24 text-[#5a615c] dark:text-[#9ca3af]">API Key</span>
 <span className="rounded-lg bg-[#f0f6f4] dark:bg-[#1e2b27] px-3 py-1.5 font-mono text-xs text-[#141613] dark:text-[#e8e6e0]">{systemAi?.ai_api_key_masked ??"未配置"}</span>
 </div>
 </div>
 </section>

 {/* AI Configuration */}
 <section className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h2 className="text-lg font-semibold tracking-tight">🤖 自定义 AI 配置</h2>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">自定义后将覆盖系统默认配置，留空则使用系统配置</p>
 <div className="mt-5 space-y-4">
 <div>
 <label className="mb-1 block text-xs font-medium text-[#5a615c] dark:text-[#9ca3af]">Base URL</label>
 <input
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2.5 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 placeholder="如 https://api.openai.com/v1"
 value={settings.ai_base_url}
 onChange={(e) => setSettings((s) => ({ ...s, ai_base_url: e.target.value }))}
 />
 </div>
 <div>
 <label className="mb-1 block text-xs font-medium text-[#5a615c] dark:text-[#9ca3af]">API Key</label>
 <input
 type="password"
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2.5 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 placeholder="sk-..."
 value={settings.ai_api_key}
 onChange={(e) => setSettings((s) => ({ ...s, ai_api_key: e.target.value }))}
 />
 </div>
 <div>
 <label className="mb-1 block text-xs font-medium text-[#5a615c] dark:text-[#9ca3af]">模型 ID</label>
 <input
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2.5 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 placeholder="如 gpt-4o、claude-3-5-sonnet"
 value={settings.ai_model}
 onChange={(e) => setSettings((s) => ({ ...s, ai_model: e.target.value }))}
 />
 </div>

 {/* Test Connection Button */}
 <div className="flex items-center gap-3 pt-2">
 <button
 type="button"
 disabled={testing}
 onClick={handleTest}
 className="rounded-2xl border border-[#1f5e4b] dark:border-[#4ade80] px-5 py-2.5 text-sm font-medium text-[#1f5e4b] dark:text-[#4ade80] transition hover:bg-[#f0f6f4] dark:hover:bg-[#1e2b27] dark:hover:bg-[#1e2b27] disabled:opacity-60"
 >
 {testing ?"测试中..." :"🔗 测试连接"}
 </button>
 <span className="text-xs text-[#5a615c] dark:text-[#9ca3af]">验证 AI 接口是否可用（将消耗少量 token）</span>
 </div>

 {/* Test Result */}
 {testResult && (
 <div className={`rounded-2xl p-4 text-sm ${testResult.ok ?"bg-[#f0fdf4] dark:bg-[#122117] text-[#166534] dark:text-[#86efac]" :"bg-[#fef2f2] dark:bg-[#2a1215] text-[#991b1b] dark:text-[#fca5a5]"}`}>
 <div className="flex items-center gap-2 font-semibold">
 {testResult.ok ?"✅" :"❌"} {testResult.ok ? testResult.message : testResult.error}
 </div>
 {testResult.ok && (
 <div className="mt-2 space-y-1 text-xs">
 <div>实际模型：<span className="font-mono">{testResult.model_used}</span></div>
 {testResult.reply && <div>模型回复：<span className="font-mono">{testResult.reply}</span></div>}
 {testResult.usage && (
 <div>Token 用量：{testResult.usage.total_tokens}（输入 {testResult.usage.prompt_tokens} + 输出 {testResult.usage.completion_tokens}）</div>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 </section>

 {/* Nutrition Targets */}
 <section className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h2 className="text-lg font-semibold tracking-tight">🎯 每日营养目标</h2>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">基于中国居民膳食营养素参考摄入量，可自定义调整</p>
 <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
 {([
 { key:"daily_kcal_target", label:"能量 (kcal)", placeholder:"2000" },
 { key:"daily_protein_target", label:"蛋白质 (g)", placeholder:"65" },
 { key:"daily_fat_target", label:"脂肪 (g)", placeholder:"60" },
 { key:"daily_carb_target", label:"碳水 (g)", placeholder:"300" },
 { key:"daily_fiber_target", label:"膳食纤维 (g)", placeholder:"25" },
 ] as const).map(({ key, label, placeholder }) => (
 <div key={key}>
 <label className="mb-1 block text-xs font-medium text-[#5a615c] dark:text-[#9ca3af]">{label}</label>
 <input
 type="number"
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2.5 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 placeholder={placeholder}
 value={settings[key]}
 onChange={(e) => setSettings((s) => ({ ...s, [key]: Number(e.target.value) || 0 }))}
 />
 </div>
 ))}
 </div>
 </section>

 {/* Save */}
 <div className="flex items-center gap-4">
 <button
 type="button"
 disabled={saving}
 onClick={handleSave}
 className="rounded-2xl bg-[#1f5e4b] dark:bg-[#166534] px-6 py-3 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] transition disabled:opacity-60"
 >
 {saving ?"保存中..." :"保存设置"}
 </button>
 {msg && (
 <span className={`text-sm ${msg.includes("已保存") ?"text-[#1f5e4b] dark:text-[#4ade80]" :"text-[#b91c1c] dark:text-[#f87171]"}`}>
 {msg}
 </span>
 )}
 </div>
 </div>
 );
}
