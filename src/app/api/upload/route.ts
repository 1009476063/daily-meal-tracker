import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { putObject } from "@/lib/r2";

export const runtime = "edge";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "缺少 file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const key = `uploads/${user.id}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const result = await putObject(key, arrayBuffer, file.type || "application/octet-stream");
  return NextResponse.json(result);
}
