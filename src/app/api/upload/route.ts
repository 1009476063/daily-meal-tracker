import { NextResponse } from "next/server";
import { putObject } from "@/lib/r2";


export async function POST(request: Request) {
  const cloned = request.clone();
  const formData = await cloned.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "缺少 file" }, { status: 400 });
  }

  const userId = String(formData.get("user_id") ?? "").trim();
  const userEmail = String(formData.get("user_email") ?? "").trim();
  if (!userId || !userEmail) {
    return NextResponse.json({ error: "缺少 user_id 或 user_email" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const key = `uploads/${userId}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const contentType = file.type || "application/octet-stream";

  try {
    const result = await putObject(key, arrayBuffer, contentType);
    return NextResponse.json(result);
  } catch (uploadError: unknown) {
    const message = uploadError instanceof Error ? uploadError.message : "R2 upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
