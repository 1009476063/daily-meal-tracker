"use client";

export default function GlobalError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 return (
 <html lang="zh">
 <body className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f5] dark:bg-[#0f1412] p-6 text-center">
 <div className="max-w-md space-y-4">
 <div className="text-4xl">😵</div>
 <h1 className="text-2xl font-semibold tracking-tight">应用出错</h1>
 <p className="text-sm text-gray-500">{error.message ||"发生了未知错误"}</p>
 <button
 type="button"
 onClick={reset}
 className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-5 py-2 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] transition"
 >
 重试
 </button>
 </div>
 </body>
 </html>
 );
}
