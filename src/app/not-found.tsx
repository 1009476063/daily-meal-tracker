import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-center text-[#2f3029]">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">页面不存在</h1>
        <p className="text-sm text-[#6b6a60]">你访问的地址不存在或已失效。</p>
        <Link href="/" className="inline-block rounded-2xl bg-[#5d7a5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f6a4e]">
          返回首页
        </Link>
      </div>
    </div>
  );
}
