"use client";

import Link from"next/link";
import { useSupabaseSession } from"@/lib/supabase-browser";
import { MobileNav } from"./mobile-nav";
import { ThemeToggle } from"../theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
 const { session } = useSupabaseSession();

 const handleLogout = async () => {
 try {
 await fetch("/api/auth/logout", { method:"POST" });
 const { createSupabaseBrowserClient } = await import("@/lib/supabase-browser");
 await createSupabaseBrowserClient().auth.signOut();
 window.location.href ="/login";
 } catch {
 window.location.href ="/login";
 }
 };

 return (
 <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
 <header className="relative border-b border-[#e4e5e1] dark:border-[#2d3b36] bg-white/80 dark:bg-[#1a2120]/85 backdrop-blur-md">
 <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
 <Link href="/" className="text-lg font-semibold tracking-tight">Daily Meal</Link>

 {/* Desktop nav */}
 <div className="hidden items-center gap-3 text-sm text-[#5a615c] dark:text-[#9ca3af] sm:flex">
 <Link href="/" className="hover:text-[#141613] dark:hover:text-[#e8e6e0] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0]">今日</Link>
 <Link href="/meals/upload" className="hover:text-[#141613] dark:hover:text-[#e8e6e0] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0]">记录饮食</Link>
 <Link href="/settings" className="hover:text-[#141613] dark:hover:text-[#e8e6e0] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0]">设置</Link>
 {session?.user?.email ? (
 <Link href="/profile" className="hover:text-[#141613] dark:hover:text-[#e8e6e0] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] hover:underline">{session.user.email}</Link>
 ) : null}
 <ThemeToggle />
 <button
 type="button"
 onClick={handleLogout}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-3 py-1.5 text-[#5a615c] dark:text-[#9ca3af] transition hover:border-[#c8c4b8] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#e8e6e0] dark:hover:text-[#f0eeea] dark:hover:border-[#4a5a52] dark:hover:text-[#e8e6e0]"
 >
 退出
 </button>
 </div>

 {/* Mobile nav */}
 <MobileNav email={session?.user?.email} />
 </div>
 </header>
 <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
 </div>
 );
}
