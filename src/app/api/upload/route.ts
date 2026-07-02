import { NextResponse } from "next/server";
import { putObject } from "@/lib/r2";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthUser(request);
  if ("error" in auth) return auth.error;

  const cloned = request.clone();
  const formData = await cloned.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "缺少 file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();

  // Use local date for the R2 key path
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const key = `uploads/${auth.user.id}/${dateStr}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const contentType = file.type || "application/octet-stream";

  try {
    const result = await putObject(key, arrayBuffer, contentType);
    return NextResponse.json(result);
  } catch (uploadError: unknown) {
    const message = uploadError instanceof Error ? uploadError.message : "R2 upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
