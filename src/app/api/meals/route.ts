import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

const itemSchema = z.object({
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

const schema = z.object({
  user_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  photo_url: z.string().url().optional(),
  photo_storage_key: z.string().optional(),
  source: z.enum(["ai", "manual"]).default("ai"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { user_id, date, meal_type, photo_url, photo_storage_key, source, notes, items } =
    parsed.data;
  const supabase = createSupabaseServerClient();

  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({
      user_id,
      date,
      meal_type,
      photo_url,
      photo_storage_key,
      source,
      notes,
    })
    .select("id")
    .single();

  if (mealError) {
    return NextResponse.json({ error: mealError.message }, { status: 400 });
  }

  const mealItems = items.map((item) => ({
    meal_id: meal.id,
    name: item.name,
    ingredients: item.ingredients,
    portion_grams: item.portion_grams ?? null,
    kcal: item.kcal ?? null,
    protein_g: item.protein_g ?? null,
    fat_g: item.fat_g ?? null,
    carb_g: item.carb_g ?? null,
    fiber_g: item.fiber_g ?? null,
    confidence: item.confidence ?? null,
    is_manually_edited: source === "manual",
  }));

  const { error: itemsError } = await supabase.from("meal_items").insert(mealItems);
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  return NextResponse.json({ meal_id: meal.id });
}
