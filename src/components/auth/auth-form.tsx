"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, nickname: nickname || undefined }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(String(json.error ?? "Register failed"));
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <input
          className="w-full rounded-xl border border-[#e6e2d8] bg-white px-4 py-3 text-[#2f3029]"
          placeholder="昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      )}
      <input
        className="w-full rounded-xl border border-[#e6e2d8] bg-white px-4 py-3 text-[#2f3029]"
        type="email"
        placeholder="邮箱"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded-xl border border-[#e6e2d8] bg-white px-4 py-3 text-[#2f3029]"
        type="password"
        placeholder="密码"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="text-sm text-[#9b4d3a]">{error}</p> : null}
      <button
        disabled={loading}
        className="w-full rounded-2xl bg-[#5d7a5c] px-4 py-3 text-white disabled:opacity-60"
      >
        {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
      </button>
    </form>
  );
}
