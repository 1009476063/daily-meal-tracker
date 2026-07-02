import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth";

const schema = z.object({
  new_password: z.string().min(6, "密码至少 6 位"),
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { new_password } = parsed.data;
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.auth.admin.updateUserById(auth.user.id, {
      password: new_password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user_id: data.user.id });
  } catch (err) {
    console.error("[/api/auth/change-password]", err);
    return NextResponse.json({ error: "服务端错误" }, { status: 500 });
  }
}
