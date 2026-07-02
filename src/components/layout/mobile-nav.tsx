"use client";

import { useState } from"react";
import Link from"next/link";
import { createSupabaseBrowserClient } from"@/lib/supabase-browser";
import { ThemeToggle } from"../theme-toggle";

export function MobileNav({ email }: { email?: string }) {
 const [open, setOpen] = useState(false);

 const handleLogout = async () => {
 try {
 await fetch("/api/auth/logout", { method:"POST" });
 await createSupabaseBrowserClient().auth.signOut();
 } catch { /* ignore */ }
 window.location.href ="/login";
 };

 return (
 <div className="flex items-center gap-2 sm:hidden">
 <ThemeToggle />
 <button
 type="button"
 onClick={() => setOpen((p) => !p)}
 className="flex flex-col items-center justify-center gap-1 rounded-lg p-1.5 text-[#5a615c] dark:text-[#9ca3af] hover:bg-[#f0f6f4] dark:hover:bg-[#1e2b27] dark:hover:bg-[#1e2b27] dark:hover:bg-[#1e2b27] transition"
 aria-label="菜单"
 >
 {open ? (
 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
 <line x1="4" y1="4" x2="16" y2="16" />
 <line x1="16" y1="4" x2="4" y2="16" />
 </svg>
 ) : (
 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
 <line x1="3" y1="5" x2="17" y2="5" />
 <line x1="3" y1="10" x2="17" y2="10" />
 <line x1="3" y1="15" x2="17" y2="15" />
 </svg>
 )}
 </button>

 {open && (
 <div className="absolute left-0 right-0 top-full z-50 border-b border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] shadow-lg">
 <nav className="mx-auto flex max-w-4xl flex-col px-5 py-3">
 {email && (
 <div className="border-b border-[#e4e5e1] dark:border-[#2d3b36] py-3">
 <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-[#141613] dark:text-[#e8e6e0]">
 <span className="text-base">👤</span>
 <span className="truncate">{email}</span>
 </Link>
 </div>
 )}
 {[
 { href:"/", label:"🏠 今日概览" },
 { href:"/meals/upload", label:"📸 记录饮食" },
 { href:"/settings", label:"⚙️ 设置" },
 ].map(({ href, label }) => (
 <Link
 key={href}
 href={href}
 onClick={() => setOpen(false)}
 className="border-b border-[#e4e5e1] dark:border-[#2d3b36] py-3 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:text-[#141613] dark:hover:text-[#e8e6e0] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] transition"
 >
 {label}
 </Link>
 ))}
 <button
 type="button"
 onClick={handleLogout}
 className="py-3 text-left text-sm text-[#b91c1c] dark:text-[#f87171] hover:text-[#991b1b] dark:hover:text-[#fca5a5] dark:hover:text-[#fca5a5] dark:hover:text-[#fca5a5] transition"
 >
 🚪 退出登录
 </button>
 </nav>
 </div>
 )}
 </div>
 );
}
