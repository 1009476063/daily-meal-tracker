import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId: string | undefined = body.user_id;
    const env = getServerEnv();

    let baseUrl = env.AI_BASE_URL;
    let apiKey = env.AI_API_KEY;
    let model = env.AI_MODEL;

    if (userId) {
      try {
        const supabase = createSupabaseServerClient();
        const { data: settings } = await supabase
          .from("meal_user_settings")
          .select("ai_base_url, ai_api_key, ai_model")
          .eq("user_id", userId)
          .maybeSingle();
        if (settings?.ai_base_url) baseUrl = settings.ai_base_url;
        if (settings?.ai_api_key) apiKey = settings.ai_api_key;
        if (settings?.ai_model) model = settings.ai_model;
      } catch {}
    }

    if (body.ai_base_url) baseUrl = body.ai_base_url;
    if (body.ai_api_key) apiKey = body.ai_api_key;
    if (body.ai_model) model = body.ai_model;

    if (!baseUrl || !apiKey || !model) {
      return NextResponse.json({ ok: false, error: "AI 配置不完整，请填写 Base URL、API Key 和模型 ID" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
        body: JSON.stringify({ model, messages: [{ role: "user", content: "回复 ok" }], max_tokens: 5 }),
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ ok: false, error: `API 返回 ${res.status}: ${errText.slice(0, 200)}` });
      }

      const json = await res.json();
      return NextResponse.json({
        ok: true,
        message: "连接成功",
        model_used: json?.model ?? model,
        reply: json?.choices?.[0]?.message?.content?.trim(),
        usage: json?.usage ? { prompt_tokens: json.usage.prompt_tokens, completion_tokens: json.usage.completion_tokens, total_tokens: json.usage.total_tokens } : null,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
        return NextResponse.json({ ok: false, error: "连接超时（10秒），请检查 Base URL 是否可达" });
      }
      return NextResponse.json({ ok: false, error: `连接失败: ${fetchErr instanceof Error ? fetchErr.message : "未知错误"}` });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "测试失败" });
  }
}
