import Link from"next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
 return (
 <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
 <header className="border-b border-[#e4e5e1] dark:border-[#2d3b36]/70 dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#0f1412]/80 dark:bg-[#1a2120]/85 backdrop-blur">
 <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
 <Link href="/" className="text-lg font-semibold tracking-tight">Daily Meal</Link>
 </div>
 </header>
 {children}
 </div>
 );
}
