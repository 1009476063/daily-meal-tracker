import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm pt-24">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">创建账户</h1>
        <p className="mt-2 text-sm text-[#7a796f]">开始记录每日饮食</p>
      </div>
      <div className="rounded-3xl border border-[#e6e2d8] bg-white p-6 shadow-sm">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
