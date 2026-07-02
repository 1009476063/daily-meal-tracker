import { NextResponse } from "next/server";
import { recognizeFoodFromImage } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const maxDuration = 120; // allow up to 120s for AI recognition

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageUrl: string | undefined = body.image_url;
    const imageUrls: string[] | undefined = body.image_urls;
    const personCountRaw = body.person_count;
    const userId: string | undefined = body.user_id;

    if (!imageUrl) {
      return NextResponse.json({ error: "缺少 image_url" }, { status: 400 });
    }

    const personCount =
      typeof personCountRaw === "number" && Number.isFinite(personCountRaw) && personCountRaw >= 1
        ? Math.round(personCountRaw)
        : undefined;

    // Try to load user's AI settings
    let userAiConfig: { baseUrl?: string; apiKey?: string; model?: string } | undefined;
    if (userId) {
      try {
        const supabase = createSupabaseServerClient();
        const { data: settings } = await supabase
          .from("meal_user_settings")
          .select("ai_base_url, ai_api_key, ai_model")
          .eq("user_id", userId)
          .maybeSingle();
        if (settings?.ai_base_url && settings?.ai_api_key && settings?.ai_model) {
          userAiConfig = {
            baseUrl: settings.ai_base_url,
            apiKey: settings.ai_api_key,
            model: settings.ai_model,
          };
        }
      } catch {
        // Fall back to env defaults
      }
    }

    // Use all provided image URLs for recognition
    const urls = (imageUrls && imageUrls.length > 0) ? imageUrls : (imageUrl ? [imageUrl] : []);
    if (urls.length === 0) {
      return NextResponse.json({ error: "缺少 image_url" }, { status: 400 });
    }
    const result = await recognizeFoodFromImage(urls[0], personCount, userAiConfig, urls);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "识别失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
