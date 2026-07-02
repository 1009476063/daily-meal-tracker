import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const id = new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
  const supabase = createSupabaseServerClient();

  const { data: meal, error } = await supabase
    .from("meal_meals")
    .select("id, user_id, date, meal_type, photo_url, photo_storage_key, source, notes, created_at, meal_items(id, name, ingredients, portion_grams, kcal, protein_g, fat_g, carb_g, fiber_g, confidence, is_manually_edited)")
    .eq("id", id)
    .single();

  if (error || !meal) {
    return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
  }

  return NextResponse.json(meal);
}

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  ingredients: z.array(z.string()).default([]),
  portion_grams: z.number().nullable().optional(),
  kcal: z.number().nullable().optional(),
  protein_g: z.number().nullable().optional(),
  fat_g: z.number().nullable().optional(),
  carb_g: z.number().nullable().optional(),
  fiber_g: z.number().nullable().optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

const updateSchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  photo_url: z.string().url().optional(),
  photo_storage_key: z.string().optional(),
  source: z.enum(["ai", "manual"]).optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).optional(),
});

export async function PATCH(request: Request) {
  const id = new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { items, ...mealFields } = parsed.data;

  if (Object.keys(mealFields).length) {
    const { error } = await supabase.from("meal_meals").update(mealFields).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (items) {
    const { error: delError } = await supabase.from("meal_items").delete().eq("meal_id", id);
    if (delError) return NextResponse.json({ error: delError.message }, { status: 400 });

    const mealItems = items.map((item) => ({
      id: item.id,
      meal_id: id,
      name: item.name,
      ingredients: item.ingredients,
      portion_grams: item.portion_grams ?? null,
      kcal: item.kcal ?? null,
      protein_g: item.protein_g ?? null,
      fat_g: item.fat_g ?? null,
      carb_g: item.carb_g ?? null,
      fiber_g: item.fiber_g ?? null,
      confidence: item.confidence ?? null,
      is_manually_edited: parsed.data.source === "manual",
    }));

    const { error: insError } = await supabase.from("meal_items").insert(mealItems);
    if (insError) return NextResponse.json({ error: insError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("meal_meals").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
