"use client";

import { useEffect } from "react";
import { useSupabaseSession } from "@/lib/supabase-browser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSupabaseSession();

  useEffect(() => {
    if (!loading && !session) {
      window.location.href = "/login";
    }
  }, [loading, session]);

  if (loading || !session) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6b6a60]">
        加载中...
      </div>
    );
  }

  return <>{children}</>;
}
