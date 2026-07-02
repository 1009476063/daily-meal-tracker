import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function GET() {
  try {
    const env = getServerEnv();
    const key = env.AI_API_KEY;
    return NextResponse.json({
      ai_base_url: env.AI_BASE_URL || null,
      ai_model: env.AI_MODEL || null,
      ai_api_key_masked: key ? `${key.slice(0, 6)}${"*".repeat(Math.max(0, key.length - 10))}${key.slice(-4)}` : null,
    });
  } catch {
    return NextResponse.json({ ai_base_url: null, ai_model: null, ai_api_key_masked: null });
  }
}
