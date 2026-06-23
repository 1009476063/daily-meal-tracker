"use client";

import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#2f3029]">
      <header className="border-b border-[#e6e2d8] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Daily Meal
          </Link>
          <div className="flex items-center gap-4 text-sm text-[#6b6a60]">
            <Link href="/meals/upload" className="hover:text-[#2f3029]">
              记录饮食
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
    </div>
  );
}
