"use client";

import { useEffect } from"react";

export default function ErrorPage({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 console.error("[ErrorBoundary]", error);
 }, [error]);

 return (
 <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f5] dark:bg-[#0f1412] p-6 text-center text-[#141613] dark:text-[#e8e6e0]">
 <div className="max-w-md space-y-4">
 <div className="text-4xl">😵</div>
 <h1 className="text-2xl font-semibold tracking-tight">页面加载出错</h1>
 <p className="text-sm text-[#5a615c] dark:text-[#9ca3af]">{error.message ||"发生了未知错误，请重试。"}</p>
 <div className="flex items-center justify-center gap-3 pt-2">
 <button
 type="button"
 onClick={reset}
 className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-5 py-2 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] transition"
 >
 重试
 </button>
 <button
 type="button"
 onClick={() => (window.location.href ="/")}
 className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-5 py-2 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#f0eeea] dark:hover:text-[#e8e6e0] transition"
 >
 返回首页
 </button>
 </div>
 </div>
 </div>
 );
}
