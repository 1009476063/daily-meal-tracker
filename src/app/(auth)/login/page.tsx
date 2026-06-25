export const runtime = "edge";

import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm pt-24 px-5">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
        <p className="mt-2 text-sm text-[#7a796f]">登录你的饮食记录账户</p>
      </div>
      <div className="rounded-3xl border border-[#e6e2d8] bg-white p-6 shadow-sm">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
