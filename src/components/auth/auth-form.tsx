"use client";

import { useState } from"react";
import { createSupabaseBrowserClient } from"@/lib/supabase-browser";

type Mode ="login" |"register";

export function AuthForm({ mode }: { mode: Mode }) {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [nickname, setNickname] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);

 try {
 const supabase = createSupabaseBrowserClient();

 if (mode ==="register") {
 const res = await fetch("/api/auth/register", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ email, password, nickname: nickname || undefined }),
 });
 const json = await res.json();
 if (!res.ok) {
 throw new Error(typeof json.error ==="string" ? json.error :"注册失败");
 }
 }

 const { error: loginError } = await supabase.auth.signInWithPassword({
 email,
 password,
 });
 if (loginError) throw new Error(loginError.message);

 window.location.href ="/";
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message :"操作失败");
 } finally {
 setLoading(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 {mode ==="register" && (
 <div>
 <label className="mb-1 block text-xs text-[#5a615c] dark:text-[#9ca3af]">昵称</label>
 <input
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-4 py-3 text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] dark:placeholder:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 placeholder="给自己取个名字"
 value={nickname}
 onChange={(e) => setNickname(e.target.value)}
 />
 </div>
 )}
 <div>
 <label className="mb-1 block text-xs text-[#5a615c] dark:text-[#9ca3af]">邮箱</label>
 <input
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-4 py-3 text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] dark:placeholder:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 type="email"
 placeholder="you@example.com"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>
 <div>
 <label className="mb-1 block text-xs text-[#5a615c] dark:text-[#9ca3af]">密码</label>
 <input
 className="w-full rounded-xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-4 py-3 text-[#141613] dark:text-[#e8e6e0] placeholder:text-[#b9b5a5] dark:placeholder:text-[#6b7280] dark:text-[#6b7280] dark:placeholder:text-[#6b7280] focus:border-[#1f5e4b] dark:focus:border-[#4ade80] dark:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#1f5e4b]"
 type="password"
 placeholder="至少 6 个字符"
 required
 minLength={6}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 />
 </div>
 {error ? (
 <div className="rounded-xl bg-red-50 dark:bg-[#2a1215] border border-red-200 dark:border-[#7f1d1d] p-3 text-sm text-red-700 dark:text-[#fca5a5]">
 {error}
 </div>
 ) : null}
 <button
 disabled={loading}
 type="submit"
 className="w-full rounded-2xl bg-[#1f5e4b] dark:bg-[#166534] px-4 py-3 text-white font-medium hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] transition disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {loading ?"处理中..." : mode ==="login" ?"登录" :"注册并登录"}
 </button>
 {mode ==="register" ? (
 <p className="text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">
 已有账号？<a href="/login" className="text-[#1f5e4b] dark:text-[#4ade80] hover:underline">去登录</a>
 </p>
 ) : (
 <p className="text-center text-sm text-[#5a615c] dark:text-[#9ca3af]">
 还没有账号？<a href="/register" className="text-[#1f5e4b] dark:text-[#4ade80] hover:underline">去注册</a>
 </p>
 )}
 </form>
 );
}
