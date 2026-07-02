"use client";

import React from "react";
import { useSupabaseSession } from "@/lib/supabase-browser";
import { LandingPage } from "@/components/landing-page";
import { DashboardPage } from "@/components/dashboard-page";

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
      <div className="max-w-md space-y-4 text-center">
        <div className="text-4xl">😵</div>
        <p className="text-lg font-semibold">页面加载出错</p>
        <p className="mt-2 text-sm text-[#5a615c] dark:text-[#9ca3af]">{error.message || "发生了未知错误"}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className="rounded-full bg-[#1f5e4b] dark:bg-[#4ade80] px-5 py-2 text-sm font-medium text-white dark:text-[#0f1412] hover:bg-[#17493b] dark:hover:bg-[#22c55e] transition">重试</button>
          <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-5 py-2 text-sm text-[#5a615c] dark:text-[#9ca3af] hover:border-[#b9b5a5] dark:hover:border-[#4a5a52] hover:text-[#141613] dark:hover:text-[#e8e6e0] transition">刷新页面</button>
        </div>
      </div>
    </div>
  );
}

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[DashboardErrorBoundary]", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error ?? new Error("未知错误")} reset={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

export default function RootPage() {
  const { session, loading } = useSupabaseSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] dark:bg-[#0f1412] text-sm text-[#5a615c] dark:text-[#9ca3af]">
        加载中...
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      {session ? <DashboardPage /> : <LandingPage />}
    </DashboardErrorBoundary>
  );
}
