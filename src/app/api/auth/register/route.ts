import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nickname: z.string().min(1).max(40).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, nickname } = parsed.data;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.toLowerCase().includes("users")) {
      return NextResponse.json(
        {
          error: error.message,
          hint: "Please create required tables in Supabase SQL Editor from supabase/schema.sql.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user.id;

  const { error: profileError } = await supabase.from("users").upsert({
    id: userId,
    email,
    nickname: nickname ?? email.split("@")[0],
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ userId });
}
