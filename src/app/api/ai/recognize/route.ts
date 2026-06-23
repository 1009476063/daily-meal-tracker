import { NextResponse } from "next/server";
import { recognizeFoodFromImage } from "@/lib/ai";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "缺少 file" }, { status: 400 });
    }

    const previewUrl = URL.createObjectURL(file);
    const result = await recognizeFoodFromImage(previewUrl);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "识别失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
