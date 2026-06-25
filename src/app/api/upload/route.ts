import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { putObject } from "@/lib/r2";

export const runtime = "edge";

export async function POST(request: Request) {
  const cloned = request.clone();
  let supabase = createSupabaseServerClient();
  let user = null;

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    user = data.user;
  }

  const formData = await cloned.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "缺少 file" }, { status: 400 });
  }

  if (!user) {
    const userId = formData.get("user_id");
    const userEmail = formData.get("user_email");
    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    user = { id: String(userId), email: String(userEmail) } as { id: string; email: string };
  }

  const arrayBuffer = await file.arrayBuffer();
  const key = `uploads/${user.id}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const contentType = file.type || "application/octet-stream";

  try {
    const result = await putObject(key, arrayBuffer, contentType);
    return NextResponse.json(result);
  } catch (uploadError: unknown) {
    const message = uploadError instanceof Error ? uploadError.message : "R2 upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
