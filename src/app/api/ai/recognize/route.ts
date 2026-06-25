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

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = file.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    const result = await recognizeFoodFromImage(dataUrl);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "识别失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
