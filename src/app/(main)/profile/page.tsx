"use client";

import { useState } from"react";
import { useSupabaseSession, createSupabaseBrowserClient } from"@/lib/supabase-browser";
import { useRouter } from"next/navigation";

export default function ProfilePage() {
 const { session } = useSupabaseSession();
 const router = useRouter();
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [saving, setSaving] = useState(false);
 const [msg, setMsg] = useState<{ type:"ok" |"err"; text: string } | null>(null);

 const handleChangePassword = async () => {
 setMsg(null);

 if (!newPassword || newPassword.length < 6) {
 setMsg({ type:"err", text:"新密码至少 6 位" });
 return;
 }
 if (newPassword !== confirmPassword) {
 setMsg({ type:"err", text:"两次输入的密码不一致" });
 return;
 }
 if (!session?.user) {
 setMsg({ type:"err", text:"未登录" });
 return;
 }

 setSaving(true);
 try {
 const { data: sessData } = await createSupabaseBrowserClient().auth.getSession();
 const token = sessData.session?.access_token;

 const res = await fetch("/api/auth/change-password", {
 method:"POST",
 headers: {"Content-Type":"application/json",
 ...(token ? { Authorization: `Bearer ${token}` } : {}),
 },
 body: JSON.stringify({
 user_id: session.user.id,
 new_password: newPassword,
 }),
 });
 const json = await res.json();
 if (!res.ok) throw new Error(String(json.error ??"修改失败"));

 setMsg({ type:"ok", text:"密码已修改成功" });
 setNewPassword("");
 setConfirmPassword("");
 } catch (err) {
 setMsg({ type:"err", text: err instanceof Error ? err.message : String(err) });
 } finally {
 setSaving(false);
 }
 };

 if (!session?.user) {
 return (
 <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#5a615c] dark:text-[#9ca3af]">加载中...</div>
 );
 }

 const createdAt = session.user.created_at ? new Date(session.user.created_at) : null;

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-semibold tracking-tight">用户管理</h1>
 <button
 type="button"
 onClick={() => router.push("/")}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] transition"
 >
 ← 返回首页
 </button>
 </div>

 {/* account info */}
 <div className="rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h2 className="text-lg font-semibold tracking-tight">账户信息</h2>
 <div className="mt-4 space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-[#5a615c] dark:text-[#9ca3af]">邮箱</span>
 <span className="font-medium text-[#141613] dark:text-[#e8e6e0]">{session.user.email}</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-[#5a615c] dark:text-[#9ca3af]">用户 ID</span>
 <span className="font-mono text-xs text-[#5a615c] dark:text-[#9ca3af]">{session.user.id}</span>
 </div>
 {createdAt ? (
 <div className="flex items-center justify-between text-sm">
 <span className="text-[#5a615c] dark:text-[#9ca3af]">注册时间</span>
 <span className="text-[#141613] dark:text-[#e8e6e0]">{createdAt.getFullYear()}年{createdAt.getMonth() + 1}月{createdAt.getDate()}日</span>
 </div>
 ) : null}
 </div>
 </div>

 {/* change password */}
 <div className="rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <h2 className="text-lg font-semibold tracking-tight">修改密码</h2>
 <p className="mt-1 text-sm text-[#5a615c] dark:text-[#9ca3af]">设置一个新密码，至少 6 位字符。</p>
 <div className="mt-4 max-w-md space-y-4">
 <div>
 <label className="mb-1.5 block text-sm text-[#5a615c] dark:text-[#9ca3af]">新密码</label>
 <input
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 placeholder="至少 6 位"
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2.5 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 />
 </div>
 <div>
 <label className="mb-1.5 block text-sm text-[#5a615c] dark:text-[#9ca3af]">确认新密码</label>
 <input
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 placeholder="再次输入新密码"
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] dark:bg-[#151e1b] px-4 py-2.5 text-sm text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] dark:focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 />
 </div>

 {msg && (
 <div className={`rounded-xl p-3 text-sm ${msg.type ==="ok" ?"bg-green-50 dark:bg-[#122117] border border-green-200 dark:border-[#14532d] text-green-700 dark:text-[#86efac]" :"bg-red-50 dark:bg-[#2a1215] border border-red-200 dark:border-[#7f1d1d] text-red-700 dark:text-[#fca5a5]"}`}>
 {msg.type ==="ok" ?"✅" :"❌"}{msg.text}
 </div>
 )}

 <button
 type="button"
 disabled={saving}
 onClick={handleChangePassword}
 className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] dark:bg-[#4ade80] px-6 py-2.5 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] dark:hover:bg-[#22c55e] transition disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {saving ?"修改中..." :"修改密码"}
 </button>
 </div>
 </div>
 </div>
 );
}
