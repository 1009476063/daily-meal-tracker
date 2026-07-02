
import { AuthForm } from"@/components/auth/auth-form";

export default function LoginPage() {
 return (
 <div className="mx-auto max-w-sm pt-24 px-5">
 <div className="mb-8 text-center">
 <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
 <p className="mt-2 text-sm text-[#5a615c] dark:text-[#9ca3af]">登录你的饮食记录账户</p>
 </div>
 <div className="rounded-3xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-6 shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
 <AuthForm mode="login" />
 </div>
 </div>
 );
}
