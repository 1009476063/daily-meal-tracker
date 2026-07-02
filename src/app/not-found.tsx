import Link from"next/link";

export default function NotFound() {
 return (
 <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] dark:bg-[#0f1412] p-6 text-center text-[#141613] dark:text-[#e8e6e0]">
 <div className="max-w-md space-y-4">
 <h1 className="text-3xl font-semibold tracking-tight">页面不存在</h1>
 <p className="text-sm text-[#5a615c] dark:text-[#9ca3af]">你访问的地址不存在或已失效。</p>
 <Link href="/" className="inline-block rounded-2xl bg-[#1f5e4b] dark:bg-[#166534] dark:bg-[#4ade80] px-4 py-2 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#14532d] dark:hover:bg-[#14532d] dark:hover:bg-[#22c55e]">
 返回首页
 </Link>
 </div>
 </div>
 );
}
